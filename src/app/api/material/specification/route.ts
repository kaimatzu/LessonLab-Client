import RequestBuilder from "@/lib/hooks/builders/request-builder";
import { AdditionalSpecification } from "@/lib/hooks/context-providers/workspace-material-context";

/**
 * Retrieves all specifications associated with a workspace.
 *
 * @param requestBuilder - The RequestBuilder instance used to construct the get specifications request.
 * @returns A Promise that resolves to a Response object.
 */
export async function GET(requestBuilder: RequestBuilder) {
    requestBuilder
      // .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications`)
      .setMethod("GET")
      .setCredentials("include");
  
    try {
      const response = await fetch(requestBuilder.build());
  
      if (response.ok) {
        const specifications = await response.json();
        console.log("Specifications retrieved successfully:", specifications);
        return new Response(JSON.stringify(specifications), { status: 200 });
      } else {
        throw new Error("Failed to retrieve specifications, " + response.statusText);
      }
    } catch (error) {
      console.error("Error retrieving specifications:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
      });
    }
}

/**
 * Sends a POST request to the server to insert a specification.
 *
 * @param requestBuilder - The RequestBuilder instance used to construct the update specification request.
 * @returns A Promise that resolves to a Response object.
 */
export async function POST(requestBuilder: RequestBuilder) {
  requestBuilder
    .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications`)
    .setMethod("POST")
    .setHeaders({ 'Content-Type': 'application/json' })
    .setCredentials("include");

  try {
    const response = await fetch(requestBuilder.build());
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
      console.error('Error inserting specification:', error);
  }
}


/**
 * Sends a DELETE request to the server to delete a specification.
 *
 * @param requestBuilder - The RequestBuilder instance used to construct the delete specification request.
 * @returns A Promise that resolves to a Response object.
 */
export async function DELETE(requestBuilder: RequestBuilder) {
  requestBuilder
    .setMethod("DELETE")
    .setHeaders({ 'Content-Type': 'application/json' })
    .setCredentials("include")

  try {
    const response = await fetch(requestBuilder.build());
    if (response.ok) {
        return true;
    } else {
        console.error('Error removing specification:', response.statusText);
        return false;
    }
  } catch (error) {
      console.error('Error removing specification:', error);
      return false;
  }
}


export async function updateSpecificationName(selectedSpecificationId: string, name: string) {
  const requestBuilder = new RequestBuilder()
      .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/update/name`)
      .setMethod("PATCH")
      .setHeaders({ 'Content-Type': 'application/json' })
      .setBody(JSON.stringify({ SpecificationID: selectedSpecificationId, Name: name }))
      .setCredentials("include")

  try {
      await fetch(requestBuilder.build());
  } catch (error) {
      console.error('Error updating specification name:', error);
  }
};

export async function updateSpecificationTopic(selectedSpecificationId: string, topic: string) {
  const requestBuilder = new RequestBuilder()
      .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/update/topic`)
      .setMethod("PATCH")
      .setHeaders({ 'Content-Type': 'application/json' })
      .setBody(JSON.stringify({ SpecificationID: selectedSpecificationId, Topic: topic }))
      .setCredentials("include")
  try {
      await fetch(requestBuilder.build());
  } catch (error) {
      console.error('Error updating specification topic:', error);
  }
};

export async function updateSpecificationComprehensionLevel(selectedSpecificationId: string, comprehensionLevel: string) {
  const requestBuilder = new RequestBuilder()
      .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/update/comprehensionlevel`)
      .setMethod("PATCH")
      .setHeaders({ 'Content-Type': 'application/json' })
      .setBody(JSON.stringify({ SpecificationID: selectedSpecificationId, ComprehensionLevel: comprehensionLevel }))
      .setCredentials("include")
  try {
      await fetch(requestBuilder.build());
  } catch (error) {
      console.error('Error updating specification comprehension level:', error);
  }
};

export async function updateSpecificationWritingLevel(selectedSpecificationId: string, writingLevel: string) {
  const requestBuilder = new RequestBuilder()
      .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/update/writinglevel`)
      .setMethod("PATCH")
      .setHeaders({ 'Content-Type': 'application/json' })
      .setBody(JSON.stringify({ SpecificationID: selectedSpecificationId, WritingLevel: writingLevel }))
      .setCredentials("include")
  try {
      await fetch(requestBuilder.build());
  } catch (error) {
      console.error('Error updating specification writing level:', error);
  }
};

export async function insertAdditionalSpecification(index: number, selectedSpecificationId: string, additionalSpecs: AdditionalSpecification[]) {
  const additionalSpec = additionalSpecs[index];
  try {
    const requestBody = {
      SpecificationID: selectedSpecificationId,
      LastAdditionalSpecificationID: additionalSpec ? additionalSpec.id || null : null
    };

    const requestBuilder = new RequestBuilder()
      .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/additionalspecifications`)
      .setMethod("POST")
      .setHeaders({ 'Content-Type': 'application/json' })
      .setBody(JSON.stringify(requestBody))
      .setCredentials("include");

    const response = await fetch(requestBuilder.build());
    
    if(response.ok) {
        const result = await response.json();
        return result;
    } else {
      console.error('Error inserting additional specification:', response.statusText);
    }
  } catch (error) {
    console.error('Error inserting additional specification:', error);
  }
};

export async function fetchAdditionalSpecifications(selectedSpecificationId: string) {
  try {
    const requestBuilder = new RequestBuilder()
      .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/additionalspecifications/${selectedSpecificationId}`)
      .setMethod("GET")
      .setCredentials("include");

    const response = await fetch(requestBuilder.build());

    if (response.ok) {
      const data = await response.json();

      console.log(data)
      return data.additionalSpecifications;
    } else {
      console.error('Error fetching additional specifications:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching additional specifications:', error);
  }
};

export async function updateAdditionalSpecification(index: number, SpecificationText: string, additionalSpecs: AdditionalSpecification[]) {
  const additionalSpec = additionalSpecs[index];
  console.log("Update called", additionalSpecs)
  try {
    const requestBody = {
      AdditionalSpecID: additionalSpec.id,
      SpecificationText: SpecificationText,
    };

    const requestBuilder = new RequestBuilder()
      .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/additionalspecifications`)
      .setMethod("PATCH")
      .setHeaders({ 'Content-Type': 'application/json' })
      .setBody(JSON.stringify(requestBody))
      .setCredentials("include");

    const response = await fetch(requestBuilder.build());
    
    if(response.ok) {
        const result = await response.json();
        return result;
    } else {
      console.error('Error updating additional specification:', response.statusText);
    }
  } catch (error) {
    console.error('Error updating additional specification:', error);
  }
};

export async function removeAdditionalSpecification(index: number, additionalSpecs: AdditionalSpecification[]) {
  const additionalSpec = additionalSpecs[index];
  console.log("Delete called")

  const requestBuilder = new RequestBuilder()
      .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/additionalspecifications/${additionalSpec.id}`)
      .setMethod("DELETE")
      .setCredentials("include");

  try {
      const response = await fetch(requestBuilder.build());
      if (response.ok) {
          return true;
      } else {
          console.error('Error removing additional specification:', response.statusText);
          return false;
      }
  } catch (error) {
      console.error('Error removing additional specification:', error);
      return false;
  }
};
