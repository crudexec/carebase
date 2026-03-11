import { ErrorState } from "@/types/GeneralTypes";

// Define a generic type 'FormSchema' representing a schema for form validation
type FormSchema<T> = {
  // Define a method 'safeParse' which takes form data of type 'T' and returns either a success object or an error object
  safeParse(formData: T):
    | { success: true; data: T } // If validation is successful, return success object with validated data
    | { success: false; error: { errors: { message: string }[] } }; // If validation fails, return error object with error messages
};

// Function to validate form data based on a provided schema
const validateForm = <T>(formData: T, schema: FormSchema<T>): T | string[] => {
  const result = schema.safeParse(formData); // Validate form data using the provided schema
  if (result.success) {
    // If validation is successful
    return result.data; // Return the validated form data
  } else {
    // If validation fails
    const errorMessage = result.error.errors.map((error) => error.message); // Extract error messages
    return errorMessage; // Return array of error messages
  }
};

// Function to execute validation logic on form data using a validation function and schema
const validationEngine = <T>(
  formData: T,
  validationFunction: (formData: T, schema: FormSchema<T>) => T | string[], // Validation function to execute
  schema: FormSchema<T> // Schema for form validation
): ErrorState => {
  const validationResult = validationFunction(formData, schema); // Execute validation function on form data

  if (Array.isArray(validationResult)) {
    // If validation result is an array (indicating errors)
    const errorObj: ErrorState = {
      field: [],
      message: [],
    };

    validationResult.forEach((error) => {
      // Iterate over each error message
      errorObj.field.push(error); // Add error to the 'field' array
      errorObj.message.push(error); // Add error to the 'message' array
    });

    return errorObj; // Return the error object
  }

  return {
    // If no errors, return an empty error state
    field: [],
    message: [],
  };
};

// Export the 'validateForm' and 'validationEngine' functions for use in other modules
// Export the 'validateForm' and 'validationEngine' functions for use in other modules
export { validateForm, validationEngine };
