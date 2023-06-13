import type {
  ApiBaseMetadata,
  ApiDataParameter,
  ApiEndpoint,
  ApiEntry,
  ApiParameter,
  ApiSpec,
} from "./api-spec.types";
import type {
  ApiGetEndpoint,
  ApiGetEndpointBody,
} from "./basic-utilities.types";
import type {
  InferInputTypeFromSchema,
  InferOutputTypeFromSchema,
  SchemaType,
} from "./schema-type.types";
import { ApiTypeScriptSchema } from "./schema-type-ts";

/**
 * Get the schema type for the api spec by looking at the metadata
 * Allows to define a default schema type for the api spec if none is defined
 * @param Api - Api spec
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Schema type
 */
export type ApiGetSchemaType<
  Api extends ApiSpec,
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema
> = Api["metadata"] extends infer Meta extends ApiBaseMetadata
  ? Meta["schemaType"] extends infer Type extends SchemaType
    ? Type
    : DefaultSchemaType
  : DefaultSchemaType;

/**
 * Get the schema type for an endpoint by looking at the metadata
 * If the endpoint has no metadata, the schema type for the api spec is returned
 * Allows to define a default schema type if none is defined in any of the metadata
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Schema type
 */
export type ApiGetEndpointSchemaType<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema,
  ComputedEndpoint extends ApiEndpoint = ApiGetEndpoint<Api, Endpoint>
> = ComputedEndpoint["metadata"] extends infer Meta extends ApiBaseMetadata
  ? Meta["schemaType"] extends infer Type extends SchemaType
    ? Type
    : ApiGetSchemaType<Api, DefaultSchemaType>
  : ApiGetSchemaType<Api, DefaultSchemaType>;

/**
 * Get the schema type for the body of an endpoint by looking at the metadata
 * If the body has no metadata, the schema type for the endpoint is returned
 * If the endpoint has no metadata, the schema type for the api spec is returned
 * Allows to define a default schema type if none is defined in any of the metadata
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Schema type
 */
export type ApiGetEndpointBodySchemaType<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema
> = ApiGetEndpointBody<
  Api,
  Endpoint
> extends infer Param extends ApiDataParameter
  ? Param["metadata"] extends infer Meta extends ApiBaseMetadata
    ? Meta["schemaType"] extends infer Type extends SchemaType
      ? Type
      : ApiGetEndpointSchemaType<Api, Endpoint, DefaultSchemaType>
    : ApiGetEndpointSchemaType<Api, Endpoint, DefaultSchemaType>
  : ApiGetEndpointSchemaType<Api, Endpoint, DefaultSchemaType>;

/**
 * Get the schema type for an entry of an endpoint by looking at the metadata
 * If the entry has no metadata, the schema type for the endpoint is returned
 * If the endpoint has no metadata, the schema type for the api spec is returned
 * Allows to define a default schema type if none is defined in any of the metadata
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param Entry - Entry name
 * @param EntryParam - Entry parameter name
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Schema type
 */
export type ApiGetEndpointEntrySchemaType<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  Entry extends ApiEntry,
  EntryParam extends keyof ApiGetEndpoint<Api, Endpoint>[Entry],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema
> = ApiGetEndpoint<
  Api,
  Endpoint
>[Entry][EntryParam] extends infer Param extends ApiParameter
  ? Param["metadata"] extends infer Meta extends ApiBaseMetadata
    ? Meta["schemaType"] extends infer Type extends SchemaType
      ? Type
      : ApiGetEndpointSchemaType<Api, Endpoint, DefaultSchemaType>
    : ApiGetEndpointSchemaType<Api, Endpoint, DefaultSchemaType>
  : ApiGetEndpointSchemaType<Api, Endpoint, DefaultSchemaType>;

/**
 * Infer the typescript input type for an endpoint body
 * input type is the data type that needs to be passed as body to the endpoint before validating it
 * Use SchemaType cascading rules to determine the schema type to use
 * Cascading rules:
 * 1. If the body has a schema type defined, use it
 * 2. Else if the endpoint has a schema type defined, use it
 * 3. Else if the api spec has a schema type defined, use it
 * 4. Else use the default schema type
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Typescript Input type for the endpoint body
 */
export type ApiInferEndpointBody<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema
> = ApiGetEndpointBody<
  Api,
  Endpoint
> extends infer Param extends ApiDataParameter
  ? InferInputTypeFromSchema<
      NonNullable<
        ApiGetEndpointBodySchemaType<
          Api,
          Endpoint,
          DefaultSchemaType
        >["_provider"]
      >,
      Param["schema"]
    >
  : InferInputTypeFromSchema<
      NonNullable<
        ApiGetEndpointSchemaType<Api, Endpoint, DefaultSchemaType>["_provider"]
      >,
      ApiGetEndpointBody<Api, Endpoint>
    >;

/**
 * Infer the typescript input type for an endpoint entry (path, query, header, cookie, response)
 * input type is the data type that needs to be passed as entry to the endpoint before validating it
 * Use SchemaType cascading rules to determine the schema type to use
 * Cascading rules:
 * 1. If the entry has a schema type defined, use it
 * 2. Else if the endpoint has a schema type defined, use it
 * 3. Else if the api spec has a schema type defined, use it
 * 4. Else use the default schema type
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param Entry - Entry name
 * @param EntryParam - Entry parameter name
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Typescript Input type for the endpoint entry
 */
export type ApiInferEndpointInputEntry<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  Entry extends ApiEntry,
  EntryParam extends keyof ApiGetEndpoint<Api, Endpoint>[Entry],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema,
  ComputedEntryParam = ApiGetEndpoint<Api, Endpoint>[Entry][EntryParam]
> = ComputedEntryParam extends ApiParameter
  ? InferInputTypeFromSchema<
      NonNullable<
        ApiGetEndpointEntrySchemaType<
          Api,
          Endpoint,
          Entry,
          EntryParam,
          DefaultSchemaType
        >["_provider"]
      >,
      ComputedEntryParam["schema"]
    >
  : InferInputTypeFromSchema<
      NonNullable<
        ApiGetEndpointEntrySchemaType<
          Api,
          Endpoint,
          Entry,
          EntryParam,
          DefaultSchemaType
        >["_provider"]
      >,
      ComputedEntryParam
    >;

/**
 * Infer the typescript output type for an endpoint entry (path, query, header, cookie, response)
 * output type is the data type that is returned by the endpoint after validating it
 * Use SchemaType cascading rules to determine the schema type to use
 * Cascading rules:
 * 1. If the entry has a schema type defined, use it
 * 2. Else if the endpoint has a schema type defined, use it
 * 3. Else if the api spec has a schema type defined, use it
 * 4. Else use the default schema type
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param Entry - Entry name
 * @param EntryParam - Entry parameter name
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Typescript Output type for the endpoint entry
 */
export type ApiInferEndpointOutputEntry<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  Entry extends ApiEntry,
  EntryParam extends keyof ApiGetEndpoint<Api, Endpoint>[Entry],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema,
  ComputedEntryParam = ApiGetEndpoint<Api, Endpoint>[Entry][EntryParam]
> = ComputedEntryParam extends ApiParameter
  ? InferOutputTypeFromSchema<
      NonNullable<
        ApiGetEndpointEntrySchemaType<
          Api,
          Endpoint,
          Entry,
          EntryParam,
          DefaultSchemaType
        >["_provider"]
      >,
      ComputedEntryParam["schema"]
    >
  : InferOutputTypeFromSchema<
      NonNullable<
        ApiGetEndpointEntrySchemaType<
          Api,
          Endpoint,
          Entry,
          EntryParam,
          DefaultSchemaType
        >["_provider"]
      >,
      ComputedEntryParam
    >;

/**
 * Infer the typescript input type for an endpoint path parameter
 * input type is the data type that needs to be passed as path parameter to the endpoint before validating it
 * Use SchemaType cascading rules to determine the schema type to use
 * Cascading rules:
 * 1. If the path parameter has a schema type defined, use it
 * 2. Else if the endpoint has a schema type defined, use it
 * 3. Else if the api spec has a schema type defined, use it
 * 4. Else use the default schema type
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param PathParam - Path parameter name
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Typescript Input type for the endpoint path parameter
 */
export type ApiInferEndpointInputParam<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  PathParam extends keyof ApiGetEndpoint<Api, Endpoint>["params"],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema
> = ApiInferEndpointInputEntry<
  Api,
  Endpoint,
  "params",
  PathParam,
  DefaultSchemaType
>;

/**
 * Infer the typescript input type for an endpoint query parameter
 * input type is the data type that needs to be passed as query parameter to the endpoint before validating it
 * Use SchemaType cascading rules to determine the schema type to use
 * Cascading rules:
 * 1. If the query parameter has a schema type defined, use it
 * 2. Else if the endpoint has a schema type defined, use it
 * 3. Else if the api spec has a schema type defined, use it
 * 4. Else use the default schema type
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param QueryParam - Query parameter name
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Typescript Input type for the endpoint query parameter
 */
export type ApiInferEndpointInputQuery<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  QueryParam extends keyof ApiGetEndpoint<Api, Endpoint>["query"],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema
> = ApiInferEndpointInputEntry<
  Api,
  Endpoint,
  "query",
  QueryParam,
  DefaultSchemaType
>;

/**
 * Infer the typescript input type for an endpoint header parameter
 * input type is the data type that needs to be passed as header parameter to the endpoint before validating it
 * Use SchemaType cascading rules to determine the schema type to use
 * Cascading rules:
 * 1. If the header parameter has a schema type defined, use it
 * 2. Else if the endpoint has a schema type defined, use it
 * 3. Else if the api spec has a schema type defined, use it
 * 4. Else use the default schema type
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param HeaderParam - Header parameter name
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Typescript Input type for the endpoint header parameter
 */
export type ApiInferEndpointInputHeader<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  HeaderParam extends keyof ApiGetEndpoint<Api, Endpoint>["headers"],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema
> = ApiInferEndpointInputEntry<
  Api,
  Endpoint,
  "headers",
  HeaderParam,
  DefaultSchemaType
>;

/**
 * Infer the typescript input type for an endpoint cookie parameter
 * input type is the data type that needs to be passed as cookie parameter to the endpoint before validating it
 * Use SchemaType cascading rules to determine the schema type to use
 * Cascading rules:
 * 1. If the cookie parameter has a schema type defined, use it
 * 2. Else if the endpoint has a schema type defined, use it
 * 3. Else if the api spec has a schema type defined, use it
 * 4. Else use the default schema type
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param CookieParam - Cookie parameter name
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Typescript Input type for the endpoint cookie parameter
 */
export type ApiInferEndpointInputCookie<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  CookieParam extends keyof ApiGetEndpoint<Api, Endpoint>["cookies"],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema
> = ApiInferEndpointInputEntry<
  Api,
  Endpoint,
  "cookies",
  CookieParam,
  DefaultSchemaType
>;

/**
 * Infer the typescript input type for an endpoint response body
 * input type is the data type that needs to be passed as response body to the endpoint before validating it
 * Use SchemaType cascading rules to determine the schema type to use
 * Cascading rules:
 * 1. If the response body has a schema type defined, use it
 * 2. Else if the endpoint has a schema type defined, use it
 * 3. Else if the api spec has a schema type defined, use it
 * 4. Else use the default schema type
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param StatusCode - Response status code
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Typescript Input type for the endpoint response body
 */
export type ApiInferEndpointInputResponse<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  StatusCode extends keyof ApiGetEndpoint<Api, Endpoint>["responses"],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema
> = ApiInferEndpointInputEntry<
  Api,
  Endpoint,
  "responses",
  StatusCode,
  DefaultSchemaType
>;

/**
 * Infer the typescript output type for an endpoint path parameter
 * output type is the data type that is returned after validating the endpoint path parameter
 * Use SchemaType cascading rules to determine the schema type to use
 * Cascading rules:
 * 1. If the path parameter has a schema type defined, use it
 * 2. Else if the endpoint has a schema type defined, use it
 * 3. Else if the api spec has a schema type defined, use it
 * 4. Else use the default schema type
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param PathParam - Path parameter name
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Typescript Output type for the endpoint path parameter
 */
export type ApiInferEndpointOutputParam<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  PathParam extends keyof ApiGetEndpoint<Api, Endpoint>["params"],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema
> = ApiInferEndpointOutputEntry<
  Api,
  Endpoint,
  "params",
  PathParam,
  DefaultSchemaType
>;

/**
 * Infer the typescript output type for an endpoint query parameter
 * output type is the data type that is returned after validating the endpoint query parameter
 * Use SchemaType cascading rules to determine the schema type to use
 * Cascading rules:
 * 1. If the query parameter has a schema type defined, use it
 * 2. Else if the endpoint has a schema type defined, use it
 * 3. Else if the api spec has a schema type defined, use it
 * 4. Else use the default schema type
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param QueryParam - Query parameter name
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Typescript Output type for the endpoint query parameter
 */
export type ApiInferEndpointOutputQuery<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  QueryParam extends keyof ApiGetEndpoint<Api, Endpoint>["query"],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema
> = ApiInferEndpointOutputEntry<
  Api,
  Endpoint,
  "query",
  QueryParam,
  DefaultSchemaType
>;

/**
 * Infer the typescript output type for an endpoint header parameter
 * output type is the data type that is returned after validating the endpoint header parameter
 * Use SchemaType cascading rules to determine the schema type to use
 * Cascading rules:
 * 1. If the header parameter has a schema type defined, use it
 * 2. Else if the endpoint has a schema type defined, use it
 * 3. Else if the api spec has a schema type defined, use it
 * 4. Else use the default schema type
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param HeaderParam - Header parameter name
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Typescript Output type for the endpoint header parameter
 */
export type ApiInferEndpointOutputHeader<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  HeaderParam extends keyof ApiGetEndpoint<Api, Endpoint>["headers"],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema
> = ApiInferEndpointOutputEntry<
  Api,
  Endpoint,
  "headers",
  HeaderParam,
  DefaultSchemaType
>;

/**
 * Infer the typescript output type for an endpoint cookie parameter
 * output type is the data type that is returned after validating the endpoint cookie parameter
 * Use SchemaType cascading rules to determine the schema type to use
 * Cascading rules:
 * 1. If the cookie parameter has a schema type defined, use it
 * 2. Else if the endpoint has a schema type defined, use it
 * 3. Else if the api spec has a schema type defined, use it
 * 4. Else use the default schema type
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param CookieParam - Cookie parameter name
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Typescript Output type for the endpoint cookie parameter
 */
export type ApiInferEndpointOutputCookie<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  CookieParam extends keyof ApiGetEndpoint<Api, Endpoint>["cookies"],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema
> = ApiInferEndpointOutputEntry<
  Api,
  Endpoint,
  "cookies",
  CookieParam,
  DefaultSchemaType
>;

/**
 * Infer the typescript output type for an endpoint response body
 * output type is the data type that is returned after validating the endpoint response body
 * Use SchemaType cascading rules to determine the schema type to use
 * Cascading rules:
 * 1. If the response body has a schema type defined, use it
 * 2. Else if the endpoint has a schema type defined, use it
 * 3. Else if the api spec has a schema type defined, use it
 * 4. Else use the default schema type
 * @param Api - Api spec
 * @param Endpoint - Endpoint name
 * @param StatusCode - Response status code
 * @param DefaultSchemaType - Optional schema type to use if none is defined, defaults to TypeScript schema
 * @returns Typescript Output type for the endpoint response body
 */
export type ApiInferEndpointOutputResponse<
  Api extends ApiSpec,
  Endpoint extends keyof Api["endpoints"],
  StatusCode extends keyof ApiGetEndpoint<Api, Endpoint>["responses"],
  DefaultSchemaType extends SchemaType = typeof ApiTypeScriptSchema
> = ApiInferEndpointOutputEntry<
  Api,
  Endpoint,
  "responses",
  StatusCode,
  DefaultSchemaType
>;
