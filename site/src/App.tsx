import { SignedIn, SignedOut, SignInButton, UserButton, useSession } from "@clerk/clerk-react";
import './App.css';
import { useRef, useState } from "react";
import { API_URL } from "./constants";
import useSQLite from "./hooks/useSQLite";


export default function App() {
  const { isLoaded, session, isSignedIn } = useSession();
  const [apiResponse, setApiResponse] = useState('');
  const { isLoading, runQuery, updateDB } = useSQLite();
  const fileInputRef = useRef(null);
  const [tablesList, setTablesList] = useState([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState([]);

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

  const loadTables = async () => {
    const results = await runQuery("SELECT * FROM sqlite_master WHERE type='table';");
    const tableNames = results.map(({ name }) => name);
    setTablesList(tableNames);
    if (tableNames.length > 0) {
      await loadTable(tableNames[0]);
    }

  }

  const loadTable = async (tableName) => {
    console.log('load table:', tableName);
    // Use table_info to get column metadata for a specific table.
    const tableInfo = await runQuery(`PRAGMA table_info(${tableName});`)
    console.log(tableInfo);
    setTableData(await runQuery(`SELECT * FROM "${tableName}";`) as never[]);


    setSelectedTable(tableName);
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
      <div >
        <input
          type="file"
          ref={fileInputRef}
          accept=".sqlite3,.db,.sqlite"
          style={{ display: 'none' }}
          onChange={async (e) => {
            await updateDB(e.target.files?.[0]);
            e.target.value = "";

            await loadTables();
          }}
        />
        <button onClick={() => fileInputRef.current.click()}>Choose File</button>
        {
          tablesList.length > 0 &&
          <select value={selectedTable ?? ''} onChange={(e) => {
            console.log(e);
            loadTable(e.target.value);
          }}>
            <option value=''>Select a table</option>
            {tablesList.map((name) =>
              <option key={name} value={name}>
                {name}
              </option>)}
          </select>
        }
      </div>
      {
        isLoading ?
          <p>loading...</p>
          :
          <pre>{JSON.stringify(tableData, null, 2)}</pre>
      }
    </SignedIn>
    {
      /*
         <button onClick={requestFromApi}>Test API</button>
    <pre>
      {apiResponse}
    </pre>
      */
    }
  </>);
}
