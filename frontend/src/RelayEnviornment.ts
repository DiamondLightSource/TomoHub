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

// FULL DISCLOSURE:
// I do not know what this code does, it is copied from the workflows git repository
// frontend/dashboard/src/RelayEnvironment.ts
// all I know is the subscribe function is run when a subscription is created and it needs to be added to the Network object
let kcinitPromise: Promise<boolean> | null = null;

// needed to prevent repeated refresh of page when using subscriptions
function ensureKeycloakInit(): Promise<boolean> {
  if (!kcinitPromise) {
    kcinitPromise = keycloak
      .init({
        onLoad: "login-required",
      })
      .catch((err: unknown) => {
        console.error("Keycloak init failed", err);
        return false;
      });
  }
  return kcinitPromise;
}

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

export const RelayEnvironment = createRelayEnvironment();
