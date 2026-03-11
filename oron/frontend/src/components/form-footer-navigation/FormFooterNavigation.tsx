"use client";

import Button from "../button/Button";

interface Props {
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  totalSection: number;
  submitFunc?: () => void;
}

const FormFooterNavigation = ({
  currentIndex,
  handleChangeIndex,
  totalSection,
  submitFunc,
}: Props) => {
  return (
    <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
      <Button
        variant="light"
        onClick={() => handleChangeIndex(currentIndex - 1)}
        type="button"
        disabled={currentIndex === 1}
      >
        Previous Section
      </Button>

      {currentIndex !== totalSection && (
        <Button type="submit">Next Section</Button>
      )}

      {currentIndex === totalSection && (
        <Button onClick={submitFunc} type="button">
          Submit
        </Button>
      )}
    </div>
  );
};

export default FormFooterNavigation;
