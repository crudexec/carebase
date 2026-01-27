import React from "react";
import ImageMarker, { Marker } from "react-image-marker";

import { Button, Modal } from "@/components/ui";

const WoundLocation = ({
  open,
  modalClose,
  markers,
  callback,
  onClear,
  onSubmit,
  loading,
}: {
  open: boolean;
  modalClose: () => void;
  markers: Array<Marker>;
  callback: (marker: Array<Marker>) => void;
  onClear: () => void;
  onSubmit: () => void;
  loading: boolean;
}) => {
  return (
    <Modal
      title={"Wound Location"}
      open={open}
      onClose={modalClose}
      className="md:max-w-[600px] sm:max-w-full"
    >
      <div className="border rounded flex flex-col justify-center items-center">
        <ImageMarker
          src="/images/wound-location.png"
          markers={markers}
          markerComponent={() => (
            <div className="w-4 h-4 md:w-6 md:h-6 bg-[red] rounded-full" />
          )}
          extraClass="h-[300px] w-[300px] md:h-[400px] md:w-[500px]"
          onAddMarker={(marker: Marker) => callback([...markers, marker])}
        />
      </div>

      <div className="flex justify-between items-center mt-5">
        <Button variant="destructive" onClick={onClear}>
          Clear
        </Button>
        <Button type="button" onClick={onSubmit} loading={loading}>
          Save Changes
        </Button>
      </div>
    </Modal>
  );
};

export default WoundLocation;
