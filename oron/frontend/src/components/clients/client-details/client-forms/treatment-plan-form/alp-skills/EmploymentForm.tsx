import React from "react";
import FormInput from "@/components/input-fields/FormInput";

const EmploymentForm = () => {
  return (
    <>
    {/* Work Experiences / Career Explorations Section */}
    <div className="bg-white rounded-3xl p-6 border shadow-sm">
      <h2 className="font-medium text-xl mb-6">Work Experiences / Career Explorations</h2>

      <div className="rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
          <div className="p-4 font-medium text-gray-700">Skills</div>
          <div className="p-4 font-medium text-gray-700">Areas of support</div>
        </div>

        {/* Work Experiences */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">What Work Experiences / Career Explorations Do You Have?</div>
          <div className="p-4">
            <FormInput
              name="employment.workExperiences.experiences"
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
              name="employment.workExperiences.potentialBarriers"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>

        {/* Related information */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">Related information from other AW services</div>
          <div className="p-4">
            <FormInput
              name="employment.workExperiences.relatedInfo"
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
              name="employment.workExperiences.otherComments"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Competitive Employment Section */}
    <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
      <h2 className="font-medium text-xl mb-6">Competitive Employment</h2>

      <div className="rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
          <div className="p-4 font-medium text-gray-700">Skills</div>
          <div className="p-4 font-medium text-gray-700">Areas of support</div>
        </div>

        {/* Competitive Employment */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">What Type Of Competitive Employment Are You Seeking?</div>
          <div className="p-4">
            <FormInput
              name="employment.competitive.type"
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
              name="employment.competitive.potentialBarriers"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>

        {/* Related information */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">Related information from other AW services</div>
          <div className="p-4">
            <FormInput
              name="employment.competitive.relatedInfo"
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
              name="employment.competitive.otherComments"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Supported Employment Section */}
    <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
      <h2 className="font-medium text-xl mb-6">Supported Employment</h2>

      <div className="rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
          <div className="p-4 font-medium text-gray-700">Skills</div>
          <div className="p-4 font-medium text-gray-700">Areas of support</div>
        </div>

        {/* Supported Employment */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">What Type Of Supported Employment Are You Seeking?</div>
          <div className="p-4">
            <FormInput
              name="employment.supported.type"
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
              name="employment.supported.potentialBarriers"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>

        {/* Related information */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">Related information from other AW services</div>
          <div className="p-4">
            <FormInput
              name="employment.supported.relatedInfo"
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
              name="employment.supported.otherComments"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Customized Employment Section */}
    <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
      <h2 className="font-medium text-xl mb-6">Customized Employment</h2>

      <div className="rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
          <div className="p-4 font-medium text-gray-700">Skills</div>
          <div className="p-4 font-medium text-gray-700">Areas of support</div>
        </div>

        {/* Customized Employment */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">What Type Of Customized Employment Are You Seeking?</div>
          <div className="p-4">
            <FormInput
              name="employment.customized.type"
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
              name="employment.customized.potentialBarriers"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>

        {/* Related information */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">Related information from other AW services</div>
          <div className="p-4">
            <FormInput
              name="employment.customized.relatedInfo"
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
              name="employment.customized.otherComments"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Creative Self-Employment Section */}
    <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
      <h2 className="font-medium text-xl mb-6">Creative Self-Employment</h2>

      <div className="rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
          <div className="p-4 font-medium text-gray-700">Skills</div>
          <div className="p-4 font-medium text-gray-700">Areas of support</div>
        </div>

        {/* Creative Self-Employment */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">What Type Of Creative Self-Employment Are You Seeking?</div>
          <div className="p-4">
            <FormInput
              name="employment.creative.type"
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
              name="employment.creative.potentialBarriers"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>

        {/* Related information */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">Related information from other AW services</div>
          <div className="p-4">
            <FormInput
              name="employment.creative.relatedInfo"
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
              name="employment.creative.otherComments"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Job Supports And Reasonable Accommodations Section */}
    <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
      <h2 className="font-medium text-xl mb-6">Job Supports And Reasonable Accommodations</h2>

      <div className="rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
          <div className="p-4 font-medium text-gray-700">Skills</div>
          <div className="p-4 font-medium text-gray-700">Areas of support</div>
        </div>

        {/* Job Supports */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">
            What Type Of Job Supports And Reasonable Accommodations Are You Seeking?
          </div>
          <div className="p-4">
            <FormInput
              name="employment.jobSupports.type"
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
              name="employment.jobSupports.potentialBarriers"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>

        {/* Related information */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">Related information from other AW services</div>
          <div className="p-4">
            <FormInput
              name="employment.jobSupports.relatedInfo"
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
              name="employment.jobSupports.otherComments"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Workplace Skills Section */}
    <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
      <h2 className="font-medium text-xl mb-6">Workplace Skills</h2>

      <div className="rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
          <div className="p-4 font-medium text-gray-700">Skills</div>
          <div className="p-4 font-medium text-gray-700">Areas of support</div>
        </div>

        {/* Workplace Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">What Type Of Workplace Skills Do You Require?</div>
          <div className="p-4">
            <FormInput
              name="employment.workplaceSkills.type"
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
              name="employment.workplaceSkills.potentialBarriers"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>

        {/* Related information */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">Related information from other AW services</div>
          <div className="p-4">
            <FormInput
              name="employment.workplaceSkills.relatedInfo"
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
              name="employment.workplaceSkills.otherComments"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Options Other Than Employment Section */}
    <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
      <h2 className="font-medium text-xl mb-6">Options Other Than Employment</h2>

      <div className="rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
          <div className="p-4 font-medium text-gray-700">Skills</div>
          <div className="p-4 font-medium text-gray-700">Areas of support</div>
        </div>

        {/* Options Other Than Employment */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">What Options Other Than Employment Are You Interested In?</div>
          <div className="p-4">
            <FormInput
              name="employment.otherOptions.options"
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
              name="employment.otherOptions.potentialBarriers"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>

        {/* Related information */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t">
          <div className="p-4 text-gray-900">Related information from other AW services</div>
          <div className="p-4">
            <FormInput
              name="employment.otherOptions.relatedInfo"
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
              name="employment.otherOptions.otherComments"
              placeholder="Enter here"
              type="text"
              className="w-full rounded-lg border-gray-200"
            />
          </div>
        </div>
      </div>
    </div>
  </>
  )
}

export default EmploymentForm