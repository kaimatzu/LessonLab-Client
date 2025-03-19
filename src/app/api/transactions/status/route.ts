import RequestBuilder from "@/lib/hooks/builders/request-builder";

export async function GET(request: Request) {
  const refNum = new URL(request.url).searchParams.get("refNum");
  
  if (!refNum) {
    return new Response(JSON.stringify({ error: "Reference number is required" }), {
      status: 400,
    });
  }

  const requestBuilder = new RequestBuilder()
    .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions/checkout_status/${refNum}`)
    .setMethod("GET")
    .setCredentials("include")
    .setHeaders({
      "Content-Type": "application/json",
    });

  try {
    const response = await fetch(requestBuilder.build());
    const data = await response.json();
    console.log('>>> %cAPI data:', 'color:orange', data);

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction status: ${data.message}`);
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error fetching transaction status:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
