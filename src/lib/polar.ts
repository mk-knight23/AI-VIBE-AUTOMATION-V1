import { Polar } from "polar-sdk";

export const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN || "",
    server: "sandbox", // Use "sandbox" for testing
});
