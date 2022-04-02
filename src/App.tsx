import axios, { AxiosPromise } from 'axios';
import { useEffect, useState } from 'react';

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
  status: string;
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

function App() {
  const [isAscOrder, setOrder] = useState<boolean>(true);
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

  if (userIds.length > 0) {
    const userPosts = selectedUserId ? postsByUserId[selectedUserId] : [];

    return (
      <div>
        <ul>
          {userIds.map((userId) => (
            <li key={userId}>
              <button type="button" onClick={() => setUserId(userId)}>
                {postsByUserId[userId][0].from_name}
                <span style={{ marginLeft: 8, background: 'lightgray' }}>
                  {postsByUserId[userId].length}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setOrder((prev) => !prev)}>
          {isAscOrder ? 'asc' : 'desc'}
        </button>
        <ul>
          {userPosts
            .sort((a, b) => {
              const timeA = new Date(a.created_time).getTime();
              const timeB = new Date(b.created_time).getTime();
              return isAscOrder ? timeA - timeB : timeB - timeA;
            })
            .map((item) => (
              <li>
                <div>{item.created_time}</div>
                {item.message}
              </li>
            ))}
        </ul>
      </div>
    );
  }

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
