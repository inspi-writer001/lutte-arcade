import maps from "../assets/placeholders/maps.png";

const Maps = () => {
  return (
    <div
      className="flex justify-center items-center w-screen h-screen text-center flex-col px-10 bg-[#3b2f2f]"
      style={{
        backgroundImage: `url(${maps})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      Maps
    </div>
  );
};

export default Maps;
