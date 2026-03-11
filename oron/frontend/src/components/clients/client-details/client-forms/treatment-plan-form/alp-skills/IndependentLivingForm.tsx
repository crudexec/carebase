import React from "react";
import FormInput from "@/components/input-fields/FormInput";

interface Props {
  register: any;
  errors: any;
  values: any;
}

const advocacySkills = [
  "Choice Making Skills",
  "Decision Making Skills",
  "Problem-Solving Skills",
  "Goal Setting & Attainment Skills",
  "Self-Regulation Skills",
  "Self-Advocacy Skills",
  "Self-Awareness And Self-Knowledge Skills",
];

const selfDirectionsSkills = [
  "Planning & Organizing Skills",
  "Self-Direction Skills",
  "Self-Motivation Skills",
  "Determining What Is Important",
  "Setting & Achieving Goals",
  "Taking Authority",
  "Taking Risks",
  "Taking Responsibility",
];

const communicationSkills = [
  "Planning & Organizing Skills",
  "Augmentative And Alternative Communication (AAC) Method",
  "Supports Required For Communication",
];

const homeLivingSkills = [
  "Maintaining Good Hygiene",
  "Getting Dressed",
  "Stay On Schedule",
  "Household Cleaning",
  "Laundry",
  "Home Maintenance",
  "Meal Preparation",
  "Shopping",
];

const IndependentLivingForm: React.FC<Props> = ({
  register,
  errors,
  values,
}) => {
  return (
    <>
      {/* Self Advocacy / Self Determination Section */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm">
        <h2 className="font-medium text-xl mb-6">
          Self Advocacy / Self Determination
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
          {advocacySkills.map((skill, idx) => (
            <div
              key={skill}
              className="grid grid-cols-1 md:grid-cols-2 border-t"
            >
              <div className="p-4 text-gray-900">{skill}</div>
              <div className="p-4">
                <FormInput
                  name={`independentLiving.selfAdvocacy.skills.${idx}`}
                  placeholder="Not applicable"
                  type="text"
                  value={values?.selfAdvocacy?.skills?.[idx] || ""}
                  onChange={() => {}}
                  {...register(`independentLiving.selfAdvocacy.skills.${idx}`)}
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
                name="independentLiving.selfAdvocacy.potentialBarriers"
                placeholder="Enter here"
                type="text"
                value={values?.selfAdvocacy?.potentialBarriers || ""}
                onChange={() => {}}
                {...register(
                  "independentLiving.selfAdvocacy.potentialBarriers"
                )}
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
                name="independentLiving.selfAdvocacy.relatedInfo"
                placeholder="Enter here"
                type="text"
                value={values?.selfAdvocacy?.relatedInfo || ""}
                onChange={() => {}}
                {...register("independentLiving.selfAdvocacy.relatedInfo")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Other Comments */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Other Comments</div>
            <div className="p-4">
              <FormInput
                name="independentLiving.selfAdvocacy.otherComments"
                placeholder="Enter here"
                type="text"
                value={values?.selfAdvocacy?.otherComments || ""}
                onChange={() => {}}
                {...register("independentLiving.selfAdvocacy.otherComments")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">Self Directions</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Skills rows */}
          {selfDirectionsSkills.map((skill, idx) => (
            <div
              key={skill}
              className="grid grid-cols-1 md:grid-cols-2 border-t"
            >
              <div className="p-4 text-gray-900">{skill}</div>
              <div className="p-4">
                <FormInput
                  name={`independentLiving.selfDirections.skills.${idx}`}
                  placeholder="Not applicable"
                  type="text"
                  value={values?.selfDirections?.skills?.[idx] || ""}
                  onChange={() => {}}
                  {...register(
                    `independentLiving.selfDirections.skills.${idx}`
                  )}
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
                name="independentLiving.selfDirections.potentialBarriers"
                placeholder="Enter here"
                type="text"
                value={values?.selfDirections?.potentialBarriers || ""}
                onChange={() => {}}
                {...register(
                  "independentLiving.selfDirections.potentialBarriers"
                )}
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
                name="independentLiving.selfDirections.relatedInfo"
                placeholder="Enter here"
                type="text"
                value={values?.selfDirections?.relatedInfo || ""}
                onChange={() => {}}
                {...register("independentLiving.selfDirections.relatedInfo")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Other Comments */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Other Comments</div>
            <div className="p-4">
              <FormInput
                name="independentLiving.selfDirections.otherComments"
                placeholder="Enter here"
                type="text"
                value={values?.selfDirections?.otherComments || ""}
                onChange={() => {}}
                {...register("independentLiving.selfDirections.otherComments")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">Communication</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
          </div>

          {/* Skills rows */}
          {communicationSkills.map((skill, idx) => (
            <div
              key={skill}
              className="grid grid-cols-1 md:grid-cols-2 border-t"
            >
              <div className="p-4 text-gray-900">{skill}</div>
              <div className="p-4">
                <FormInput
                  name={`independentLiving.communication.skills.${idx}`}
                  placeholder="Not applicable"
                  type="text"
                  value={values?.communication?.skills?.[idx] || ""}
                  onChange={() => {}}
                  {...register(`independentLiving.communication.skills.${idx}`)}
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
                name="independentLiving.communication.potentialBarriers"
                placeholder="Enter here"
                type="text"
                value={values?.communication?.potentialBarriers || ""}
                onChange={() => {}}
                {...register(
                  "independentLiving.communication.potentialBarriers"
                )}
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
                name="independentLiving.communication.relatedInfo"
                placeholder="Enter here"
                type="text"
                value={values?.communication?.relatedInfo || ""}
                onChange={() => {}}
                {...register("independentLiving.communication.relatedInfo")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Other Comments */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t">
            <div className="p-4 text-gray-900">Other Comments</div>
            <div className="p-4">
              <FormInput
                name="independentLiving.communication.otherComments"
                placeholder="Enter here"
                type="text"
                value={values?.communication?.otherComments || ""}
                onChange={() => {}}
                {...register("independentLiving.communication.otherComments")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border shadow-sm mt-8">
        <h2 className="font-medium text-xl mb-6">Home Living</h2>

        <div className="rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Skills</div>
            <div className="p-4 font-medium text-gray-700">
              Areas of support
            </div>
            <div className="p-4 font-medium text-gray-700">
              Level of support needed
            </div>
          </div>

          {/* Skills rows */}
          {homeLivingSkills.map((skill, idx) => (
            <div
              key={skill}
              className="grid grid-cols-1 md:grid-cols-3 border-t"
            >
              <div className="p-4 text-gray-900">{skill}</div>
              <div className="p-4">
                <FormInput
                  name={`independentLiving.homeLiving.areasOfSupport.${idx}`}
                  placeholder="Not applicable"
                  type="text"
                  value={values?.homeLiving?.areasOfSupport?.[idx] || ""}
                  onChange={() => {}}
                  {...register(
                    `independentLiving.homeLiving.areasOfSupport.${idx}`
                  )}
                  className="w-full rounded-lg border-gray-200"
                />
              </div>
              <div className="p-4">
                <FormInput
                  name={`independentLiving.homeLiving.levelOfSupport.${idx}`}
                  placeholder="Supervision"
                  type="text"
                  value={values?.homeLiving?.levelOfSupport?.[idx] || ""}
                  onChange={() => {}}
                  {...register(
                    `independentLiving.homeLiving.levelOfSupport.${idx}`
                  )}
                  className="w-full rounded-lg border-gray-200"
                />
              </div>
            </div>
          ))}

          {/* Potential Barriers */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-t">
            <div className="p-4 text-gray-900">Potential Barriers</div>
            <div className="p-4 md:col-span-2">
              <FormInput
                name="independentLiving.homeLiving.potentialBarriers"
                placeholder="Enter here"
                type="text"
                value={values?.homeLiving?.potentialBarriers || ""}
                onChange={() => {}}
                {...register("independentLiving.homeLiving.potentialBarriers")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Related information */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-t">
            <div className="p-4 text-gray-900">
              Related information from other AW services
            </div>
            <div className="p-4 md:col-span-2">
              <FormInput
                name="independentLiving.homeLiving.relatedInfo"
                placeholder="Enter here"
                type="text"
                value={values?.homeLiving?.relatedInfo || ""}
                onChange={() => {}}
                {...register("independentLiving.homeLiving.relatedInfo")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>

          {/* Other Comments */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-t">
            <div className="p-4 text-gray-900">Other Comments</div>
            <div className="p-4 md:col-span-2">
              <FormInput
                name="independentLiving.homeLiving.otherComments"
                placeholder="Enter here"
                type="text"
                value={values?.homeLiving?.otherComments || ""}
                onChange={() => {}}
                {...register("independentLiving.homeLiving.otherComments")}
                className="w-full rounded-lg border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IndependentLivingForm;
