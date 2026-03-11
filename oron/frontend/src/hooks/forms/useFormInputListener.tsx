import { useEffect, RefObject, useState } from "react";

const useFormInputListener = (
  formRef: RefObject<HTMLFormElement>,
  isLoading: any
) => {
  const [values, setValue] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    const formElement = formRef.current;

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        const state = getFormValues();

        setValue(state);
      }
    };
    if (formElement) {
      formElement.addEventListener("input", handleInput);
    }

    return () => {
      if (formElement) {
        formElement.removeEventListener("input", handleInput);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formRef, isLoading]);

  const getInputValue = (name: string) => {
    if (formRef.current) {
      const inputElement = formRef.current.querySelector<
        HTMLInputElement | HTMLTextAreaElement
      >(`[name="${name}"]`);
      if (inputElement) {
        return inputElement.value;
      }
    }
    return null;
  };

  const setInputValue = (name: string, value: string) => {
    if (formRef.current) {
      const inputElement = formRef.current.querySelector<
        HTMLInputElement | HTMLTextAreaElement
      >(`[name="${name}"]`);
      if (inputElement) {
        setValue((prev) => ({
          ...prev,
          [name]: value,
        }));
        inputElement.value = value;
        inputElement.dispatchEvent(new Event("input", { bubbles: true })); // Manually trigger input event
      }
    }
  };
  const getFormValues = () => {
    const values: { [key: string]: string } = {};
    if (formRef.current) {
      const formElements = formRef.current.elements;
      for (let i = 0; i < formElements.length; i++) {
        const element = formElements[i] as
          | HTMLInputElement
          | HTMLTextAreaElement
          | HTMLSelectElement;
        if (element.name) {
          values[element.name] = element.value;
        }
      }
    }
    return values;
  };

  const handleGetValue = (name: string) => {
    const nameValue = getInputValue(name);
    return nameValue;
  };

  return { handleGetValue, setInputValue, getFormValues, values };
};

export default useFormInputListener;
