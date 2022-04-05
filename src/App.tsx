import axios, { AxiosPromise } from 'axios';
import { useEffect, useState } from 'react';
import './App.css';

interface LoginData {
  name: string;
  email: string;
}

interface TokenData {
  sl_token: string;
  client_id: string;
  email: string;
}

interface Post {
  created_time: string;
  from_id: string;
  from_name: string;
  id: string;
  message: string;
  type: string;
}

interface PostsData {
  page: number;
  posts: Post[];
}

function registerToken(data: LoginData): AxiosPromise<{ data: TokenData }> {
  return axios.post('https://api.supermetrics.com/assignment/register', {
    ...data,
    client_id: 'ju16a6m81mhid5ue1z3v2g0uh',
  });
}

function fetchPosts(page: number): AxiosPromise<{ data: PostsData }> {
  return axios.get('https://api.supermetrics.com/assignment/posts', {
    params: {
      sl_token: localStorage.getItem('token'),
      page,
    },
  });
}

function fetchAllPosts() {
  return Promise.all(
    Array.from({ length: 10 }).map((_, index) => fetchPosts(index + 1)),
  ).then((responses) => responses.reduce<Post[]>((acc, item) => {
    acc.push(...item.data.data.posts);
    return acc;
  }, []));
}

type PostsByUserId = Record<string, Post[]>;

function Posts() {
  const [isAscOrder, setOrder] = useState<boolean>(false);
  const [selectedUserId, setUserId] = useState<string | null>(null);
  const [postsByUserId, setPostsByUserId] = useState<PostsByUserId>({});

  useEffect(() => {
    fetchAllPosts().then((responsePosts) => {
      const byUserId: PostsByUserId = {};

      responsePosts.forEach((item) => {
        const userPosts = byUserId[item.from_id];

        if (userPosts === undefined) {
          byUserId[item.from_id] = [item];
        } else {
          userPosts.push(item);
        }
      });

      setPostsByUserId(byUserId);
    });
  }, []);

  const userIds = Object.keys(postsByUserId);
  const userPosts = selectedUserId ? postsByUserId[selectedUserId] : [];

  return (
    <div className="posts-container">
      <section className="users">
        {userIds.map((userId) => (
          <button
            className="user"
            key={userId}
            type="button"
            onClick={() => setUserId(userId)}
          >
            {postsByUserId[userId][0].from_name}
            <span>
              {postsByUserId[userId].length}
            </span>
          </button>
        ))}
      </section>
      <section>
        <button type="button" onClick={() => setOrder((prev) => !prev)}>
          {isAscOrder ? 'Ascending' : 'Descending'}
        </button>
        {userPosts
          .sort((a, b) => {
            const timeA = new Date(a.created_time).getTime();
            const timeB = new Date(b.created_time).getTime();
            return isAscOrder ? timeA - timeB : timeB - timeA;
          })
          .map((item) => (
            <article className="post">
              <time>{new Date(item.created_time).toLocaleString()}</time>
              {item.message}
            </article>
          ))}
      </section>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    axios.interceptors.response.use(undefined, () => {
      setToken(null);
      localStorage.removeItem('token');
    });
  }, []);

  if (token) {
    return <Posts />;
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const loginData = Object.fromEntries(formData) as unknown as LoginData;
        registerToken(loginData).then(({ data }) => {
          localStorage.setItem('token', data.data.sl_token);
          setToken(data.data.sl_token);
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
  );
}

export default App;
