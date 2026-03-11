import React from "react";
import FormInput from "@/components/input-fields/FormInput";

const EducationForm = () => {
  return (
    <>
      {/* Types Of Post Education Model Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm">
        <h2 className="font-medium text-xl mb-6">
          Types Of Post Education Model
        </h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Education Model Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">
              What Types Of Education Model Are You Considering?
            </div>
            <div className="p-4">
              <FormInput
                name="education.model.types"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Potential Barriers */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Potential Barriers</div>
            <div className="p-4">
              <FormInput
                name="education.model.potentialBarriers"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Related information */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">
              Related information from other AW services
            </div>
            <div className="p-4">
              <FormInput
                name="education.model.relatedInfo"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Other Comments */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Other Comments</div>
            <div className="p-4">
              <FormInput
                name="education.model.otherComments"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Types Of Post-Secondary Education Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">
          Types Of Post-Secondary Education
        </h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Post-Secondary Education Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">
              What Types Of Post-Secondary Education Are You Considering?
            </div>
            <div className="p-4">
              <FormInput
                name="education.postSecondary.types"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Potential Barriers */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Potential Barriers</div>
            <div className="p-4">
              <FormInput
                name="education.postSecondary.potentialBarriers"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Related information */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">
              Related information from other AW services
            </div>
            <div className="p-4">
              <FormInput
                name="education.postSecondary.relatedInfo"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Other Comments */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Other Comments</div>
            <div className="p-4">
              <FormInput
                name="education.postSecondary.otherComments"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EducationForm;
