import { SignedIn, SignedOut, SignInButton, UserButton, useSession } from "@clerk/clerk-react";
import './App.css';
import { useState } from "react";
import { API_URL } from "./constants";


export default function App() {
  const { isLoaded, session, isSignedIn } = useSession();
  const [apiResponse, setApiResponse] = useState('');

  const requestFromApi = async () => {
    setApiResponse('');

    console.log('Is loaded:', isLoaded);
    console.log('Is signed in:', isSignedIn);
    if (!session) {
      console.log('No session!');
      setApiResponse('User is not signed in!');
      return;
    }
    console.log('Session ID:', session.id);
    console.log('User ID:', session.user.id);
    console.log('Session Expires At:', session.expireAt);

    // Get the session token for API authentication
    const sessionToken = await session.getToken();

    console.log('Session Token:', sessionToken);

    try {
      // Make a request to the protected backend route
      const response = await fetch(`${API_URL}/protected?session_id=${session.id}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('API Response:', data['message']);
      // Display the API response on the page
      setApiResponse(`FASTAPI Response: ${JSON.stringify(data['message'])}`);
    } catch (error) {
      console.error('Error calling API:', error);
      setApiResponse(`Error calling API: ${error}`);
    }
  }

  return (<>
    <header>
      <div id="title-wrapper">
        <img src="/favicon.svg" alt="Logo of tree" width={32} height={32} />
        <h1>
          Kwila Demo
        </h1>
      </div>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
    <SignedIn>
      {/* TODO: show sql viewer here */}
      <p>
        You are signed in. List page coming soon!
      </p>
    </SignedIn>
    <button onClick={requestFromApi}>Test API</button>
    <pre>
      {apiResponse}
    </pre>
  </>);
}
