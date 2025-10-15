/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title:
          "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body className="bg-gray-50">
        <nav className="bg-white shadow-md border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex gap-6 py-4 text-base items-center">
              <Link
                to="/"
                activeProps={{
                  className: "font-bold text-indigo-600",
                }}
                activeOptions={{ exact: true }}
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                🏠 Home
              </Link>
              <Link
                to="/posts"
                activeProps={{
                  className: "font-bold text-indigo-600",
                }}
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                📄 Posts
              </Link>
              <Link
                to="/users"
                activeProps={{
                  className: "font-bold text-indigo-600",
                }}
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                👥 Users
              </Link>
              <Link
                to="/route-a"
                activeProps={{
                  className: "font-bold text-indigo-600",
                }}
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                🔀 Pathless Layout
              </Link>
              <Link
                to="/deferred"
                activeProps={{
                  className: "font-bold text-indigo-600",
                }}
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                ⏱️ Deferred
              </Link>
              <Link
                // @ts-expect-error
                to="/this-route-does-not-exist"
                activeProps={{
                  className: "font-bold text-indigo-600",
                }}
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                🚫 404
              </Link>
              <Link
                to="/notes"
                activeProps={{
                  className: "font-bold text-indigo-600",
                }}
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                📝 Notes
              </Link>
            </div>
          </div>
        </nav>
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
