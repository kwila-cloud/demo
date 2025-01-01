import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import './App.css';

export default function App() {
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
  </>);
}
