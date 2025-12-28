/**
 * Interface for a normalized address returned by the validation service.
 */
export interface NormalizedAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
}

/**
 * Validates an address using the Google Address Validation API.
 * Falls back to basic regex validation if no API key is present.
 *
 * @param address - The address components to validate.
 * @returns A promise resolving to the normalized address or throwing an error if invalid.
 */
export async function validateAddress(address: {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
}): Promise<NormalizedAddress> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn(
      "Google Maps API Key not found. Falling back to basic validation."
    );
    return basicValidation(address);
  }

  // Google Address Validation API logic
  try {
    const response = await fetch(
      `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: {
            regionCode: "US",
            locality: address.city,
            administrativeArea: address.state,
            postalCode: address.zipCode,
            addressLines: [address.addressLine1, address.addressLine2].filter(
              Boolean
            ),
          },
        }),
      }
    );

    if (!response.ok) {
      // If the specific Validation API is not enabled or key is invalid, fallback.
      console.warn(
        `Validation API error: ${response.status} ${response.statusText}`
      );
      return basicValidation(address);
    }

    const data = await response.json();
    const result = data.result;

    if (result.verdict?.addressComplete) {
      // Simplified data mapping. In a full app, parsing `addressComponents` is better.
      const postalAddress = result.address.postalAddress;

      return {
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: postalAddress.locality || address.city,
        state: postalAddress.administrativeArea || address.state,
        zipCode: postalAddress.postalCode || address.zipCode,
      };
    } else {
      // Even if not "complete", it might be valid enough, but stricter is better for shipping.
      // Let's check if it has at least a granularity of PREMISE or SUB_PREMISE
      const granularity = result.verdict?.validationGranularity;
      if (granularity === "PREMISE" || granularity === "SUB_PREMISE") {
        const postalAddress = result.address.postalAddress;
        return {
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: postalAddress.locality || address.city,
          state: postalAddress.administrativeArea || address.state,
          zipCode: postalAddress.postalCode || address.zipCode,
        };
      }

      throw new Error(
        "Address could not be fully validated. Please check your details."
      );
    }
  } catch (error) {
    console.error("Address validation failed:", error);
    return basicValidation(address);
  }
}

function basicValidation(address: {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
}): Promise<NormalizedAddress> {
  // Simple checks
  if (!address.addressLine1 || address.addressLine1.trim().length < 5) {
    throw new Error("Address Line 1 is too short.");
  }
  if (!address.city || address.city.trim().length === 0) {
    throw new Error("City is required.");
  }
  if (!address.state || address.state.trim().length !== 2) {
    throw new Error("State must be 2 letters (e.g. NY).");
  }
  if (!address.zipCode || !/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
    throw new Error("Invalid Zip Code format (e.g. 12345).");
  }

  return Promise.resolve({
    ...address,
    addressLine1: address.addressLine1.trim(),
    addressLine2: address.addressLine2?.trim(),
    city: address.city.trim(),
    state: address.state.toUpperCase().trim(),
    zipCode: address.zipCode.trim(),
  });
}
