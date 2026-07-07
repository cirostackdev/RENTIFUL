import { cleanParams, withToast } from "@/lib/utils";
import { getToken, setToken } from "@/features/auth/lib/auth";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FiltersState } from ".";

interface AuthUser {
  userId: string;
  userRole: "tenant" | "manager";
  name: string;
  email: string;
  phoneNumber: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: "tenant" | "manager";
    name: string;
    phoneNumber: string;
  };
}

interface Property {
  id: number;
  name: string;
  description: string;
  pricePerMonth: number;
  securityDeposit: number;
  applicationFee: number;
  photoUrls: string[];
  amenities: string[];
  highlights: string[];
  isPetsAllowed: boolean;
  isParkingIncluded: boolean;
  beds: number;
  baths: number;
  squareFeet: number;
  propertyType: string;
  postedDate: string;
  averageRating: number | null;
  numberOfReviews: number | null;
  managerId: string;
  location: {
    id: number;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates: { longitude: number; latitude: number };
  };
  manager?: { id: string; name: string; email: string; phoneNumber?: string };
}

interface PropertiesResponse {
  data: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Lease {
  id: number;
  startDate: string;
  endDate: string;
  rent: number;
  deposit: number;
  propertyId: number;
  tenantId: string;
  property?: Property;
  tenant?: { id: string; name: string; email: string; phoneNumber: string };
}

interface Application {
  id: number;
  applicationDate: string;
  status: "Pending" | "Approved" | "Denied";
  propertyId: number;
  tenantId: string;
  name: string;
  email: string;
  phoneNumber: string;
  message?: string;
  leaseId?: number;
  property: Property & { address?: string };
  tenant?: { id: string; name: string; email: string };
  manager?: { id: string; name: string; email: string; phoneNumber: string };
  lease?: Lease & { nextPaymentDate?: string };
}

interface Payment {
  id: number;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  paymentDate: string;
  paymentStatus: string;
  leaseId: number;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  favorites?: Property[];
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: [
    "AuthUser",
    "Properties",
    "PropertyDetails",
    "Leases",
    "Payments",
    "Applications",
    "Tenants",
  ],
  endpoints: (build) => ({
    // Auth
    getAuthUser: build.query<AuthUser | null, void>({
      queryFn: async (_, _queryApi, _extra, fetchWithBQ) => {
        const token = getToken();
        if (!token) return { data: null };

        const result = await fetchWithBQ("/auth/me");
        if (result.error) return { data: null };

        const user = result.data as AuthResponse["user"];
        return {
          data: {
            userId: user.id,
            userRole: user.role,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
          },
        };
      },
      providesTags: ["AuthUser"],
    }),

    login: build.mutation<AuthUser, { email: string; password: string }>({
      queryFn: async (credentials, _queryApi, _extra, fetchWithBQ) => {
        const result = await fetchWithBQ({
          url: "/auth/login",
          method: "POST",
          body: credentials,
        });

        if (result.error) {
          return { error: result.error };
        }

        const { token, user } = result.data as AuthResponse;
        setToken(token);

        return {
          data: {
            userId: user.id,
            userRole: user.role,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
          },
        };
      },
      invalidatesTags: ["AuthUser"],
    }),

    register: build.mutation<
      AuthUser,
      { email: string; password: string; name: string; role: string; phoneNumber?: string }
    >({
      queryFn: async (body, _queryApi, _extra, fetchWithBQ) => {
        const result = await fetchWithBQ({
          url: "/auth/register",
          method: "POST",
          body,
        });

        if (result.error) {
          return { error: result.error };
        }

        const { token, user } = result.data as AuthResponse;
        setToken(token);

        return {
          data: {
            userId: user.id,
            userRole: user.role,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
          },
        };
      },
      invalidatesTags: ["AuthUser"],
    }),

    // Properties
    getProperties: build.query<
      Property[],
      Partial<FiltersState> & { favoriteIds?: number[] }
    >({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: filters.beds,
          baths: filters.baths,
          propertyType: filters.propertyType,
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          amenities: filters.amenities?.join(","),
          availableFrom: filters.availableFrom,
          favoriteIds: filters.favoriteIds?.join(","),
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });

        return { url: "properties", params };
      },
      transformResponse: (response: PropertiesResponse | Property[]) => {
        // Handle both paginated and non-paginated responses
        if (Array.isArray(response)) return response;
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch properties.",
        });
      },
    }),

    getProperty: build.query<Property, number>({
      query: (id) => `properties/${id}`,
      providesTags: (_result, _error, id) => [{ type: "PropertyDetails", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load property details.",
        });
      },
    }),

    createProperty: build.mutation<Property, FormData>({
      query: (newProperty) => ({
        url: "properties",
        method: "POST",
        body: newProperty,
      }),
      invalidatesTags: [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Property created successfully!",
          error: "Failed to create property.",
        });
      },
    }),

    // Tenant
    getTenant: build.query<Tenant, string>({
      query: (userId) => `tenants/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: "Tenants", id: userId }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load tenant profile.",
        });
      },
    }),

    getCurrentResidences: build.query<Property[], string>({
      query: (userId) => `tenants/${userId}/current-residences`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch current residences.",
        });
      },
    }),

    addFavoriteProperty: build.mutation<Tenant, { userId: string; propertyId: number }>({
      query: ({ userId, propertyId }) => ({
        url: `tenants/${userId}/favorites/${propertyId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Tenants", id: userId },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Added to favorites!",
          error: "Failed to add to favorites.",
        });
      },
    }),

    removeFavoriteProperty: build.mutation<Tenant, { userId: string; propertyId: number }>({
      query: ({ userId, propertyId }) => ({
        url: `tenants/${userId}/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Tenants", id: userId },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Removed from favorites!",
          error: "Failed to remove from favorites.",
        });
      },
    }),

    // Manager
    getManagerProperties: build.query<Property[], string>({
      query: (userId) => `managers/${userId}/properties`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load manager properties.",
        });
      },
    }),

    // Settings
    updateSettings: build.mutation<AuthUser, Partial<AuthUser>>({
      query: (data) => ({
        url: "auth/me",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AuthUser"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),

    // Leases
    getLeases: build.query<Lease[], void>({
      query: () => "leases",
      providesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch leases.",
        });
      },
    }),

    getPayments: build.query<Payment[], number>({
      query: (leaseId) => `leases/${leaseId}/payments`,
      providesTags: ["Payments"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch payments.",
        });
      },
    }),

    // Applications
    getApplications: build.query<Application[], { userId?: string; userType?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.userId) queryParams.append("userId", params.userId);
        if (params.userType) queryParams.append("userType", params.userType);
        return `applications?${queryParams.toString()}`;
      },
      providesTags: ["Applications"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch applications.",
        });
      },
    }),

    updateApplicationStatus: build.mutation<Application, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `applications/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Applications", "Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Application status updated!",
          error: "Failed to update application.",
        });
      },
    }),

    createApplication: build.mutation<Application, Partial<Application>>({
      query: (body) => ({
        url: "applications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Applications"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Application submitted!",
          error: "Failed to submit application.",
        });
      },
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useLoginMutation,
  useRegisterMutation,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useGetTenantQuery,
  useGetCurrentResidencesQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  useGetManagerPropertiesQuery,
  useUpdateSettingsMutation,
  useGetLeasesQuery,
  useGetPaymentsQuery,
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useCreateApplicationMutation,
} = api;
