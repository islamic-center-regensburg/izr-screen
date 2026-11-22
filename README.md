# IZR screen

TanStack Start runs on port 3000. Set `DIRECTUS_API_URL` and `DIRECTUS_READ_TOKEN` on the server with read access to `screen_config`, `screen_sections`, `prayer_times`, `iqama_times`, `news`, `events`, `campaigns`, their translations, and donations. Never put the token in a `VITE_` variable. Run `npm run dev`, `npm run typecheck`, `npm test`, and `npm run build`. Regenerate the SDK with `npm run api:generate` and a private `.env` containing `OPENAPI_INPUT`.

## Display configuration

The CMS singleton `screen_config` selects the IANA timezone, automatic or manual mode, ordered languages, landscape/portrait layout, refresh interval, and clock visibility. The screen is always dark. Automatic mode starts in the first configured language, plays the entire playlist, then repeats in the remaining configured order; language changes only when the playlist wraps. That first language is also the translation fallback. Manual mode requires `manual_section`, which is shown even if disabled or outside its automatic visibility window, and cycles its items using the section's `duration_seconds`; `manual_language` remains fixed independently of the configured language order. A missing manual selection is shown as an explicit configuration error rather than falling back to automatic mode. Prayer interruptions pause either mode and resume its independent position afterward. Arabic content is right-to-left. No thumbnail proxy is exposed; thumbnails are omitted.

`screen_sections` controls the playlist. Enabled sections whose optional `visible_from` and `visible_until` include the current instant are ordered by `sort`, then `id`. Each item in a section is shown alone for `duration_seconds`; `max_items` caps the number of items selected (ignored for prayer times, which is one item). The cycle duration is the sum of each section's item count multiplied by its duration. Counts, visibility, section settings, and content refresh while running. Localized `screen_summary` is used for news, events, and campaigns; long descriptions are never used as a fallback. Summaries allow paragraphs, line breaks, emphasis, and lists; HTML attributes and other tags are removed by the SSR-safe sanitizer before rendering. Missing summaries leave the summary area empty. Content errors and empty results have explicit visible states. The current playlist position and language pause for prayer countdowns and the Adhan-to-Iqama window, then resume. No external dashboard or legacy public remote-control endpoint is used.

Suggested seed definitions (the CMS files are unchanged):

| type | content | sort | duration_seconds | max_items |
| --- | --- | ---: | ---: | ---: |
| `prayer_times` | Today's schedule and configured iqamas | 1 | 30 | ignored |
| `news` | Published, within visibility window, newest first | 2 | 15 | 5 |
| `events` | Upcoming published events, earliest first | 3 | 15 | 3 |
| `campaign_progress` | Active campaigns; confirmed received and pending pledged, grouped by currency, with optional target | 4 | 15 | 2 |

The example cycle is 75 seconds only when each section has one item and all four sections are visible and uninterrupted. With five news items, three events, and two campaigns, it is 180 seconds per language. Content errors and empty sections are shown explicitly. Donations are aggregated on the server; individual donation records are not sent to screens. Prayer times and iqamas are read from the CMS; no schedules are synthesized. Existing prayer interruption timing uses the first configured iqama for each prayer/weekday; additional configured iqamas are displayed but do not trigger separate interruptions. Prayer-screen labels retain their existing multilingual layout rather than rotating with the content language.
## Continuous integration

GitHub Actions runs lint, typecheck, unit tests, and Trivy scans on every branch push and pull requests targeting `main`. CI uses Node.js 22. Dependency vulnerability findings are currently non-blocking, matching the website workflow; configuration findings block CI. The workflow does not build or publish Docker images and does not deploy the application.

## Display sizing

News, event, and campaign sections use viewport-height-aware sizing and compact charts. A ResizeObserver fits the complete section (including its header) only when needed, using layout-aware CSS zoom with stable line wrapping; no text is clipped or scrolled. Modern browsers with CSS zoom and ResizeObserver are required.

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
npm run test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.


## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The following scripts are available:


```bash
npm run lint
npm run format
npm run check
```


## Shadcn

Add components using the latest version of [Shadcn](https://ui.shadcn.com/).

```bash
pnpm dlx shadcn@latest add button
```



## Routing
This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).


## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/people",
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json() as Promise<{
      results: {
        name: string;
      }[];
    }>;
  },
  component: () => {
    const data = peopleRoute.useLoaderData();
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    );
  },
});
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ...

const queryClient = new QueryClient();

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
});
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from "@tanstack/react-query";

import "./App.css";

function App() {
  const { data } = useQuery({
    queryKey: ["people"],
    queryFn: () =>
      fetch("https://swapi.dev/api/people")
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  });

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
npm install @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

function App() {
  const count = useStore(countStore);
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  );
}

export default App;
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store, Derived } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
});
doubledStore.mount();

function App() {
  const count = useStore(countStore);
  const doubledCount = useStore(doubledStore);

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  );
}

export default App;
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).
