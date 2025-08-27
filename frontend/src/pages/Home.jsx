import React from "react";
import FolderList from "../components/Folders/FolderList";
import ImageGallery from "../components/ImageGallery";

const Home = () => {
  return (
    <div className="bg-black">
    <div className="flex gap-10 lg:flex-row flex-col container mx-auto">
      <div>
        <FolderList />
      </div>
      <div>
        <ImageGallery />
      </div>
    </div>
    </div>
  );
};

export default Home;
