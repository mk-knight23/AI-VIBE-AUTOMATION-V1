"use client";

import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    // Check if Clerk is configured
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (clerkPublishableKey) {
        return (
            <ClerkProvider
                publishableKey={clerkPublishableKey}
                signInUrl="/sign-in"
                signUpUrl="/sign-up"
                afterSignOutUrl="/"
            >
                <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                    {children}
                </ConvexProviderWithClerk>
            </ClerkProvider>
        );
    }

    // Fallback for development without Clerk
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
