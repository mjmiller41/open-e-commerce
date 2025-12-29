import axios from "axios";
import logger from "./logger";

const API_ENDPOINT = import.meta.env
  .VITE_GOOGLE_ADDRESS_VALIDATION_API_ENDPOINT;
const API_KEY = import.meta.env.DEV
  ? import.meta.env.VITE_GOOGLE_ADDRESS_VALIDATION_DEV_API_KEY
  : import.meta.env.VITE_GOOGLE_ADDRESS_VALIDATION_API_KEY;

export interface GoogleAddressValidationResponse {
  result: {
    verdict: {
      inputGranularity: string;
      validationGranularity: string;
      geocodeGranularity: string;
      addressComplete: boolean;
      hasUnconfirmedComponents?: boolean;
      hasInferredComponents?: boolean;
      hasReplacedComponents?: boolean;
    };
    address: {
      formattedAddress: string;
      postalAddress: {
        regionCode: string;
        languageCode: string;
        postalCode: string;
        administrativeArea: string; // State
        locality: string; // City
        addressLines: string[];
      };
      componentSpellings?: {
        [key: string]: {
          spellings: string[];
        };
      };
    };
    geocode: {
      location: {
        latitude: number;
        longitude: number;
      };
      plusCode: {
        globalCode: string;
      };
      bounds: {
        low: { latitude: number; longitude: number };
        high: { latitude: number; longitude: number };
      };
    };
    metadata: {
      business: boolean;
      residential: boolean;
    };
  };
  responseId: string;
}

export interface ValidationResult {
  isValid: boolean;
  formattedAddress?: string; // The single string formatted address
  classification?: "business" | "residential" | "unknown";
  components?: {
    street: string[];
    city: string;
    state: string;
    zip: string;
  };
  originalResponse?: GoogleAddressValidationResponse;
}

export const validateAddress = async (
  addressLines: string[],
  city: string,
  state: string,
  zipCode: string
): Promise<ValidationResult> => {
  if (!API_KEY || !API_ENDPOINT) {
    logger.error("Google Address Validation API Key or Endpoint is missing.");
    throw new Error("Address validation service is not configured.");
  }

  // More structured approach if API supports it better, but addressLines is standard
  // Ideally we pass lines + locality + admin area if we want to be specific, but the API docs say addressLines is primary.
  // Let's try to be as explicit as possible in the lines or use the structured fields if the client library were used,
  // but here we are using REST. Request body:
  // { "address": { "regionCode": "US", "addressLines": [...] } }

  const payload = {
    address: {
      regionCode: "US",
      addressLines: [...addressLines, `${city}, ${state} ${zipCode}`],
    },
  };

  try {
    const response = await axios.post<GoogleAddressValidationResponse>(
      `${API_ENDPOINT}?key=${API_KEY}`,
      payload
    );

    const result = response.data.result;
    const verdict = result.verdict;
    const address = result.address;

    // Determine validity
    // addressComplete is a strong signal.
    const isValid = verdict.addressComplete;

    return {
      isValid,
      formattedAddress: address.formattedAddress,
      classification: result.metadata?.business
        ? "business"
        : result.metadata?.residential
        ? "residential"
        : "unknown",
      components: {
        street: address.postalAddress.addressLines,
        city: address.postalAddress.locality,
        state: address.postalAddress.administrativeArea,
        zip: address.postalAddress.postalCode,
      },
      originalResponse: response.data,
    };
  } catch (error) {
    logger.error("Google Address Validation API Error:", error);
    throw error;
  }
};
