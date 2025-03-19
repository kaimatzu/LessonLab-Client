import RequestBuilder from "@/lib/hooks/builders/request-builder";

export async function GET(userId: string) {
  const requestBuilder = new RequestBuilder()
  .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/tokens?userId=${userId}`)
    .setMethod("GET")
    .setHeaders({ "Content-Type": "application/json" })
    .setCredentials("include");

  try {
    const response = await fetch(requestBuilder.build())

    const tokensData = await response.json();
    const tokens = tokensData.tokens;

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to get tokens:", errorData);
      return { responseData: errorData, success: false };
    }

    return tokens
  } catch (error) {
    console.error(error)
  }

}