import axios, { AxiosPromise } from 'axios';

interface LoginData {
  name: string;
  email: string;
}

interface TokenData {
  sl_token: string;
  client_id: string;
  email: string;
}

function registerToken(data: LoginData): AxiosPromise<{ data: TokenData }> {
  return axios.post('https://api.supermetrics.com/assignment/register', {
    ...data,
    client_id: 'ju16a6m81mhid5ue1z3v2g0uh',
  });
}

function App() {
  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const loginData = Object.fromEntries(formData) as unknown as LoginData;
          registerToken(loginData).then(({ data }) => {
            localStorage.setItem('token', data.data.sl_token);
          });
        }}
      >
        <label htmlFor="nameInput">
          Name
          <input name="name" id="nameInput" />
        </label>
        <label htmlFor="emailInput">
          E-mail
          <input name="email" id="emailInput" />
        </label>
        <button type="submit">Go</button>
      </form>
    </div>
  );
}

export default App;
