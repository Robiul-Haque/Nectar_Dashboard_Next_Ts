import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithRefresh } from "./baseQuery";

import { tagTypesList } from "./tagTypes";

export const baseApi = createApi({
    reducerPath: "baseApi",

    baseQuery: baseQueryWithRefresh,

    tagTypes: tagTypesList,

    endpoints: () => ({}),
});