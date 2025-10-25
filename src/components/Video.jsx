import { useEffect } from "react";
import { useRef } from "react";

export const Video = ({ srcObject, ...props }) => {
  const refVideo = useRef();

  useEffect(() => {
    if (refVideo.current) {
      refVideo.current.srcObject = srcObject;
    }
  }, [srcObject]);

  return <video ref={refVideo} {...props} />;
};

