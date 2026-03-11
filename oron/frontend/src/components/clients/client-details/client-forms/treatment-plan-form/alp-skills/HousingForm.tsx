import React from "react";
import FormInput from "@/components/input-fields/FormInput";

const HousingForm = () => {
  return (
    <>
      {/* Current Living Arrangement Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm">
        <h2 className="font-medium text-xl mb-6">Current Living Arrangement</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Care Of Own Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Care Of Own Health</div>
            <div className="p-4">
              <FormInput
                name="housing.currentLiving.careOfHealth"
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
                name="housing.currentLiving.potentialBarriers"
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
                name="housing.currentLiving.relatedInfo"
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
                name="housing.currentLiving.otherComments"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preferred Living Options Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">Preferred Living Options</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Preferred Living Options After 21 Years */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">
              Preferred Living Options After 21 Years
            </div>
            <div className="p-4">
              <FormInput
                name="housing.preferredLiving.optionsAfter21"
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
                name="housing.preferredLiving.potentialBarriers"
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
                name="housing.preferredLiving.relatedInfo"
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
                name="housing.preferredLiving.otherComments"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preferred Housing Options Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">Preferred Living Options</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Preferred Housing Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Preferred Housing Options</div>
            <div className="p-4">
              <FormInput
                name="housing.preferredHousing.options"
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
                name="housing.preferredHousing.potentialBarriers"
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
                name="housing.preferredHousing.relatedInfo"
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
                name="housing.preferredHousing.otherComments"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Choosing To Live With Others Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">
          Choosing To Live With Others
        </h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Factors Affecting Choice Of Housemates */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">
              What Factors Will Affect Your Choice Of Housemates?
            </div>
            <div className="p-4">
              <FormInput
                name="housing.liveWithOthers.factors"
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
                name="housing.liveWithOthers.potentialBarriers"
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
                name="housing.liveWithOthers.relatedInfo"
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
                name="housing.liveWithOthers.otherComments"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shared Household Chores Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">Shared Household Chores</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Household Chores To Share */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">
              What Household Chores Will You Like To Share?
            </div>
            <div className="p-4">
              <FormInput
                name="housing.householdChores.choresToShare"
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
                name="housing.householdChores.potentialBarriers"
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
                name="housing.householdChores.relatedInfo"
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
                name="housing.householdChores.otherComments"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preferred Housing Type Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">Preferred Housing Type</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Preferred Housing Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Preferred Housing Type</div>
            <div className="p-4">
              <FormInput
                name="housing.housingType.type"
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
                name="housing.housingType.potentialBarriers"
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
                name="housing.housingType.relatedInfo"
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
                name="housing.housingType.otherComments"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment For Preferred Living Option Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">
          Payment For Preferred Living Option
        </h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Payment For Preferred Living Option */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">
              How Will You Pay For Your Preferred Living Option?
            </div>
            <div className="p-4">
              <FormInput
                name="housing.payment.method"
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
                name="housing.payment.potentialBarriers"
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
                name="housing.payment.relatedInfo"
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
                name="housing.payment.otherComments"
                placeholder="Enter here"
                type="text"
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* In-Home Support Services Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">In-Home Support Services</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* In-Home Support Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">In-Home Support Services</div>
            <div className="p-4">
              <FormInput
                name="housing.inHomeSupport.services"
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
                name="housing.inHomeSupport.potentialBarriers"
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
                name="housing.inHomeSupport.relatedInfo"
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
                name="housing.inHomeSupport.otherComments"
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

export default HousingForm;
