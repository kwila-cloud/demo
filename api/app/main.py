import os
from typing import Union

from fastapi import FastAPI, Depends, Request, HTTPException, Query
from clerk_backend_api import Clerk
from clerk_backend_api.models import ClerkErrors, SDKError
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://demo.kwila.cloud"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
clerk_client = Clerk(bearer_auth=CLERK_SECRET_KEY)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

async def get_current_user(request: Request, session_id: str = Query(...)):
    # Authentication logic
    # Verifies the session token and session ID with Clerk
    # Returns the authenticated user or raises an exception
    # Get the session token from the Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise HTTPException(status_code=401, detail='Authorization header missing')
    print(80*'-')
    print(auth_header)
    print(80*'-')    

    # Expected format: 'Bearer <session_token>'
    if not auth_header.startswith('Bearer '):
        print("Invalid authorization header format. Expected 'Bearer <session_token>'")
        raise HTTPException(status_code=401, detail='Invalid authorization header format')

    session_token = auth_header[7:]  # Remove 'Bearer ' prefix
    print(f"Session token: {session_token}")
    print(80*'-')   
    print(f"Session ID: {session_id}")
    print(80*'-')     

    try:
        # Verify the session with Clerk
        # Note: We're using the synchronous `get` method here. Consider using the async version in production.
        res = clerk_client.sessions.get(session_id=session_id)
        print(f"User: {res.user_id}")
        print(80*'-')  
        print(f"User: {res.status}")
        print(80*'-')              
        # Return the session object
        return res

    except ClerkErrors as e:
        # Handle Clerk-specific errors
        print(f"Clerk error: {str(e)}")
        raise HTTPException(status_code=401, detail='Invalid or expired session token')
    except SDKError as e:
        # Handle general SDK errors
        print(f"SDK error: {str(e)}")
        raise HTTPException(status_code=500, detail='Internal server error')
    

@app.get("/protected")
async def protected_route(user=Depends(get_current_user)):
    # Retrieve detailed user information from Clerk
    user_details = clerk_client.users.list(user_id=[user.user_id])
    print(80*'-')
    print(f"session object: {user}") # user is ClerkUser(user)
    print(80*'-')
    print(f"user_detail: {user_details}")
    print(80*'-')
    
    # Return a personalized message using the user's first name
    return {
        "message": f"Hello, {user_details[0].first_name}!",
        # Uncomment the following lines if you want to include more user details in the response
        # "user_id": user_details[0].user_id,
        # "email": user_details[0].email_addresses[0].email_address if user_details[0].email_addresses else None,
    }
                            
