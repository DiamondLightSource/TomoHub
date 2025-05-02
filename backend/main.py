from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.centre import centre_router
from routers.methods import methods_router
from routers.yaml import yaml_router
from routers.system import system_router
from routers.httomo import httomo_router
from utils.deployment import RestrictAccessMiddleware
import strawberry 
from strawberry.fastapi import GraphQLRouter
app = FastAPI(root_path="/api")

# Apply the restriction middleware
app.add_middleware(RestrictAccessMiddleware)

# Existing middleware and routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@strawberry.type
class User:
    id: int
    name: str
    email: str

fake_users = [
    User(id=1, name="Alice", email="test1@gmail.com"),
    User(id=2, name="Bob", email="test2@gmail.com"),
]

@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello, world!"
    @strawberry.field
    def users(self) -> list[User]:
        return fake_users
@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_user(self, name: str, email: str) -> User:
        new_user = User(id=len(fake_users) + 1, name=name, email=email)
        fake_users.append(new_user)
        return new_user
    
schema = strawberry.Schema(query=Query,mutation=Mutation)
graphql_app = GraphQLRouter(schema)

app.include_router(centre_router)
app.include_router(methods_router)
app.include_router(yaml_router)
app.include_router(system_router)
app.include_router(httomo_router)

app.include_router(graphql_app, prefix="/graphql", tags=["GraphQL"])