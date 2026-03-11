import React from "react";
import FormInput from "@/components/input-fields/FormInput";

const NaturalSupportForm = () => {
  return (
    <>
      {/* Natural Support Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm">
        <h2 className="font-medium text-xl mb-6">Natural Support</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Available Natural Supports */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Available Natural Supports</div>
            <div className="p-4">
              <FormInput
                name="naturalSupport.available.skills"
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
                name="naturalSupport.available.potentialBarriers"
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
                name="naturalSupport.available.relatedInfo"
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
                name="naturalSupport.available.otherComments"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Generic Services Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">Generic Services</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Available Generic Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Available Generic Services</div>
            <div className="p-4">
              <FormInput
                name="naturalSupport.genericServices.available"
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
                name="naturalSupport.genericServices.potentialBarriers"
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
                name="naturalSupport.genericServices.relatedInfo"
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
                name="naturalSupport.genericServices.otherComments"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Community Support Systems Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">Community Support Systems</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Required Community Support Systems */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">
              Required Community Support Systems
            </div>
            <div className="p-4">
              <FormInput
                name="naturalSupport.communitySystems.required"
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
                name="naturalSupport.communitySystems.potentialBarriers"
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
                name="naturalSupport.communitySystems.relatedInfo"
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
                name="naturalSupport.communitySystems.otherComments"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Adult Disability Services Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">Adult Disability Services</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Required Adult Disability Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">
              Required Adult Disability Services
            </div>
            <div className="p-4">
              <FormInput
                name="naturalSupport.adultDisability.required"
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
                name="naturalSupport.adultDisability.potentialBarriers"
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
                name="naturalSupport.adultDisability.relatedInfo"
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
                name="naturalSupport.adultDisability.otherComments"
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

export default NaturalSupportForm;
