import "@typespec/http";

using TypeSpec.Http;

namespace SharedErrors;

model SharedErrorResponseBody<M extends string> {
  @body body: {
    // FIXME
  };
}

@doc("FIXME")
model BadRequestResponse extends SharedErrorResponseBody<"Bad Request"> {
  @statusCode _: 400;
}

alias SharedErrorResponses = BadRequestResponse;
