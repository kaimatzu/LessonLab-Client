/**
 * RequestBuilder is a custom utility class based on the builder design pattern. It is 
 * used to build and configure HTTP requests.
 * 
 * This class provides a fluent interface to set various properties of an HTTP request
 * such as method, URL, headers, body, and credentials. Once configured, it can build
 * and return a `Request` object ready to be used with the `fetch` API.
 * 
 * Usage:
 * 
 * ```typescript
 * import RequestBuilder from "@/lib/hooks/builders/request-builder";
 * 
 * const requestBuilder = new RequestBuilder()
 *   .setMethod("POST")
 *   .setURL("https://example.com/api/resource")
 *   .setHeaders({ "Content-Type": "application/json" })
 *   .setBody(JSON.stringify({ key: "value" }))
 *   .setCredentials("include");
 * 
 * const request = requestBuilder.build();
 * fetch(request)
 *   .then(response => response.json())
 *   .then(data => console.log(data))
 *   .catch(error => console.error("Error:", error));
 * ```
 */
export default class RequestBuilder {
    private method: string;
    private url: string;
    private headers: HeadersInit;
    private body: any;
    private credentials: RequestCredentials;

    constructor() {
        this.method = "GET";
        this.url = "";
        this.headers = {};
        this.body = null;
        this.credentials = "same-origin";
    }

    setMethod(method: string): RequestBuilder {
        this.method = method;
        return this;
    }

    setURL(url: string): RequestBuilder {
        this.url = url;
        return this;
    }

    setHeaders(headers: HeadersInit): RequestBuilder {
        this.headers = headers;
        return this;
    }

    setBody(body: any): RequestBuilder {
        this.body = body;
        return this;
    }

    setCredentials(credentials: RequestCredentials): RequestBuilder {
        this.credentials = credentials;
        return this;
    }

    build(): Request {
        return new Request(this.url, {
            method: this.method,
            headers: this.headers,
            body: this.body,
            credentials: this.credentials,
        });
    }
}
