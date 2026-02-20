import {
  Environment,
  Network,
  RecordSource,
  Store,
  FetchFunction,
  Observable,
  SubscribeFunction,
  GraphQLResponse,
} from "relay-runtime";
import keycloak from "./keycloak";
import { createClient } from "graphql-ws";

const HTTP_ENDPOINT = "https://workflows.diamond.ac.uk/graphql";
const WS_ENDPOINT = "wss://workflows.diamond.ac.uk/graphql/ws";

const fetchFn: FetchFunction = async (request, variables) => {
  // Refresh token if needed (minValidity in seconds)
  await keycloak.updateToken(10).catch(() => {
    keycloak.login();
  });

  if (keycloak.token) {
    const resp = await fetch(HTTP_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        Accept:
          "application/graphql-response+json; charset=utf-8, application/json; charset=utf-8",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: request.text,
        variables,
      }),
    });

    return await resp.json();
  } else {
    console.log("Not authenticated yet");
    return {};
  }
};

let kcinitPromise: Promise<boolean> | null = null;

// needed to prevent repeated refresh of page when using subscriptions
function ensureKeycloakInit(): Promise<boolean> {
  if (!kcinitPromise) {
    kcinitPromise = keycloak
      .init({
        onLoad: "login-required",
        scope: import.meta.env.VITE_KEYCLOAK_SCOPE,
      })
      .catch((err: unknown) => {
        console.error("Keycloak init failed", err);
        return false;
      });
  }
  return kcinitPromise;
}

keycloak.onTokenExpired = () => {
  console.log("JWT expired");
  keycloak
    .updateToken(10)
    .then((refreshed) => {
      if (refreshed) {
        console.log("Fetched new JWT");
      } else {
        console.warn("Token still valid");
      }
    })
    .catch((err: unknown) => {
      console.error("Failed to update JWT", err);
    });
};

export const wsClient = createClient({
  url: WS_ENDPOINT,
  connectionParams: async () => {
    if (!keycloak.authenticated) {
      await ensureKeycloakInit();
    }
    return {
      Authorization: `Bearer ${keycloak.token ?? ""}`,
    };
  },
});

const subscribe: SubscribeFunction = (operation, variables) => {
  return Observable.create((sink) => {
    const cleanup = wsClient.subscribe(
      {
        operationName: operation.name,
        query: operation.text ?? "",
        variables,
      },
      {
        next: (response) => {
          const data = response.data;
          if (data) {
            sink.next({ data } as GraphQLResponse);
          } else if (data == null) {
            console.warn("Data is null:", response);
          } else {
            console.error("Subscription error response:", response);
            sink.error(new Error("Subscription response missing data"));
          }
        },
        error: sink.error.bind(sink),
        complete: sink.complete.bind(sink),
      }
    );
    return cleanup;
  });
};

function createRelayEnvironment() {
  return new Environment({
    network: Network.create(fetchFn, subscribe),
    store: new Store(new RecordSource()),
  });
}

export async function getRelayEnvironment(): Promise<Environment> {
  await ensureKeycloakInit();
  return new Environment({
    network: Network.create(fetchFn, subscribe),
    store: new Store(new RecordSource()),
  });
}
