import React from "react";
import FormInput from "@/components/input-fields/FormInput";

interface Props {
  register: any;
  errors: any;
  values: any;
}

// Define the skills for each section
const communityMembershipSkills = ["Community Membership Engagements"];

const mobilityTransportationSkills = ["Preferred Transportation Type"];

const travellingCommunitySkills = ["Travelling In The Community"];

const unexpectedChangesSkills = [
  "Socializing And Communicating In The Community",
];

const CommunityForm = ({ register, errors, values }: Props) => {
  return (
    <>
      {/* Community Membership Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm">
        <h2 className="font-medium text-xl mb-6">Community Membership</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Skills rows */}
          {communityMembershipSkills.map((skill, idx) => (
            <div
              key={skill}
              className="grid grid-cols-1 md:grid-cols-2 border-t"
            >
              <div className="p-4 text-gray-900">{skill}</div>
              <div className="p-4">
                <FormInput
                  name={`community.membership.skills.${idx}`}
                  placeholder="Enter here"
                  type="text"
                  onChange={() => {}}
                  {...register(`community.membership.skills.${idx}`)}
                  className="w-full rounded-lg border-gray-200"
                />
              </div>
            </div>
          ))}

          {/* Potential Barriers */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Potential Barriers</div>
            <div className="p-4">
              <FormInput
                name="community.membership.potentialBarriers"
                placeholder="Enter here"
                type="text"
                value={values?.membership?.potentialBarriers || ""}
                onChange={() => {}}
                {...register("community.membership.potentialBarriers")}
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
                name="community.membership.relatedInfo"
                placeholder="Enter here"
                type="text"
                value={values?.membership?.relatedInfo || ""}
                onChange={() => {}}
                {...register("community.membership.relatedInfo")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Other Comments */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Other Comments</div>
            <div className="p-4">
              <FormInput
                name="community.membership.otherComments"
                placeholder="Enter here"
                type="text"
                value={values?.membership?.otherComments || ""}
                onChange={() => {}}
                {...register("community.membership.otherComments")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobility & Transportation Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">Mobility & Transportation</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Skills rows */}
          {mobilityTransportationSkills.map((skill, idx) => (
            <div
              key={skill}
              className="grid grid-cols-1 md:grid-cols-2 border-t"
            >
              <div className="p-4 text-gray-900">{skill}</div>
              <div className="p-4">
                <FormInput
                  name={`community.mobility.skills.${idx}`}
                  placeholder="Enter here"
                  type="text"
                  value={values?.mobility?.skills?.[idx] || ""}
                  onChange={() => {}}
                  {...register(`community.mobility.skills.${idx}`)}
                  className="w-full rounded-lg border-gray-200"
                />
              </div>
            </div>
          ))}

          {/* Potential Barriers */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Potential Barriers</div>
            <div className="p-4">
              <FormInput
                name="community.mobility.potentialBarriers"
                placeholder="Enter here"
                type="text"
                value={values?.mobility?.potentialBarriers || ""}
                onChange={() => {}}
                {...register("community.mobility.potentialBarriers")}
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
                name="community.mobility.relatedInfo"
                placeholder="Enter here"
                type="text"
                value={values?.mobility?.relatedInfo || ""}
                onChange={() => {}}
                {...register("community.mobility.relatedInfo")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Other Comments */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Other Comments</div>
            <div className="p-4">
              <FormInput
                name="community.mobility.otherComments"
                placeholder="Enter here"
                type="text"
                value={values?.mobility?.otherComments || ""}
                onChange={() => {}}
                {...register("community.mobility.otherComments")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Travelling In The Community Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">
          Travelling In The Community
        </h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Skills rows */}
          {travellingCommunitySkills.map((skill, idx) => (
            <div
              key={skill}
              className="grid grid-cols-1 md:grid-cols-2 border-t"
            >
              <div className="p-4 text-gray-900">{skill}</div>
              <div className="p-4">
                <FormInput
                  name={`community.travelling.skills.${idx}`}
                  placeholder="Enter here"
                  type="text"
                  value={values?.travelling?.skills?.[idx] || ""}
                  onChange={() => {}}
                  {...register(`community.travelling.skills.${idx}`)}
                  className="w-full rounded-lg border-gray-200"
                />
              </div>
            </div>
          ))}

          {/* Potential Barriers */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Potential Barriers</div>
            <div className="p-4">
              <FormInput
                name="community.travelling.potentialBarriers"
                placeholder="Enter here"
                type="text"
                value={values?.travelling?.potentialBarriers || ""}
                onChange={() => {}}
                {...register("community.travelling.potentialBarriers")}
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
                name="community.travelling.relatedInfo"
                placeholder="Enter here"
                type="text"
                value={values?.travelling?.relatedInfo || ""}
                onChange={() => {}}
                {...register("community.travelling.relatedInfo")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Other Comments */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Other Comments</div>
            <div className="p-4">
              <FormInput
                name="community.travelling.otherComments"
                placeholder="Enter here"
                type="text"
                value={values?.travelling?.otherComments || ""}
                onChange={() => {}}
                {...register("community.travelling.otherComments")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Handling Unexpected Changes Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">
          Handling Unexpected Changes In The Community/ Community Safety
        </h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Skills rows */}
          {unexpectedChangesSkills.map((skill, idx) => (
            <div
              key={skill}
              className="grid grid-cols-1 md:grid-cols-2 border-t"
            >
              <div className="p-4 text-gray-900">{skill}</div>
              <div className="p-4">
                <FormInput
                  name={`community.unexpectedChanges.skills.${idx}`}
                  placeholder="Enter here"
                  type="text"
                  value={values?.unexpectedChanges?.skills?.[idx] || ""}
                  onChange={() => {}}
                  {...register(`community.unexpectedChanges.skills.${idx}`)}
                  className="w-full rounded-lg border-gray-200"
                />
              </div>
            </div>
          ))}

          {/* Potential Barriers */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Potential Barriers</div>
            <div className="p-4">
              <FormInput
                name="community.unexpectedChanges.potentialBarriers"
                placeholder="Enter here"
                type="text"
                value={values?.unexpectedChanges?.potentialBarriers || ""}
                onChange={() => {}}
                {...register("community.unexpectedChanges.potentialBarriers")}
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
                name="community.unexpectedChanges.relatedInfo"
                placeholder="Enter here"
                type="text"
                value={values?.unexpectedChanges?.relatedInfo || ""}
                onChange={() => {}}
                {...register("community.unexpectedChanges.relatedInfo")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Other Comments */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Other Comments</div>
            <div className="p-4">
              <FormInput
                name="community.unexpectedChanges.otherComments"
                placeholder="Enter here"
                type="text"
                value={values?.unexpectedChanges?.otherComments || ""}
                onChange={() => {}}
                {...register("community.unexpectedChanges.otherComments")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityForm;
