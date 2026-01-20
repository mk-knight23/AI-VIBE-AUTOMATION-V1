import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-purple-950/20">
            <SignUp
                appearance={{
                    elements: {
                        formButtonPrimary:
                            "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
                        card: "bg-card/80 backdrop-blur-xl border border-border/50",
                        headerTitle: "text-foreground",
                        headerSubtitle: "text-muted-foreground",
                        socialButtonsBlockButton:
                            "border-border/50 text-foreground hover:bg-muted",
                        formFieldLabel: "text-foreground",
                        formFieldInput:
                            "bg-background border-border text-foreground placeholder:text-muted-foreground",
                        footerActionLink: "text-purple-400 hover:text-purple-300",
                    },
                }}
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                afterSignUpUrl="/dashboard"
            />
        </div>
    );
}
