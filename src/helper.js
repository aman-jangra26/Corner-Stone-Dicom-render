import { api } from 'dicomweb-client';
import dcmjs from 'dcmjs';

import { utilities } from '@cornerstonejs/core';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';



const { DicomMetaDictionary } = dcmjs.data;
const { calibratedPixelSpacingMetadataProvider } = utilities;

/**
/**
 * Uses dicomweb-client to fetch metadata of a study, cache it in cornerstone,
 * and return a list of imageIds for the frames.
 *
 * Uses the app config to choose which study to fetch, and which
 * dicom-web server to fetch it from.
 *
 * @returns {string[]} An array of imageIds for instances in the study.
 */

 async function createImageIdsAndCacheMetaData({
  StudyInstanceUID,
  SeriesInstanceUID,
  SOPInstanceUID = null,
  wadoRsRoot,
  client = null,
  convertMultiframe = true,
}) {
  const SOP_INSTANCE_UID = '00080018';
  const SERIES_INSTANCE_UID = '0020000E';
  const MODALITY = '00080060';

  const studySearchOptions = {
    studyInstanceUID: StudyInstanceUID,
    seriesInstanceUID: SeriesInstanceUID,
  };

  client = client || new api.DICOMwebClient({ url: wadoRsRoot });
  let instances = await client.retrieveSeriesMetadata(studySearchOptions);

  // if sop instance is provided we should filter the instances to only include the one we want
  if (SOPInstanceUID) {
    instances = instances.filter((instance) => {
      return instance[SOP_INSTANCE_UID].Value[0] === SOPInstanceUID;
    });
  }

  const modality = instances[0][MODALITY].Value[0];
  let imageIds = instances.map((instanceMetaData) => {
    const SeriesInstanceUID = instanceMetaData[SERIES_INSTANCE_UID].Value[0];
    const SOPInstanceUIDToUse =
      SOPInstanceUID || instanceMetaData[SOP_INSTANCE_UID].Value[0];

    const prefix = 'wadors:';

    const imageId =
      prefix +
      wadoRsRoot +
      '/studies/' +
      StudyInstanceUID.trim() +
      '/series/' +
      SeriesInstanceUID.trim() +
      '/instances/' +
      SOPInstanceUIDToUse.trim() +
      '/frames/1';

    cornerstoneDICOMImageLoader.wadors.metaDataManager.add(
      imageId,
      instanceMetaData
    );
    return imageId;
  });

  // if the image ids represent multiframe information, creates a new list with one image id per frame
  // if not multiframe data available, just returns the same list given


  imageIds.forEach((imageId) => {
    let instanceMetaData =
      cornerstoneDICOMImageLoader.wadors.metaDataManager.get(imageId);

    // It was using JSON.parse(JSON.stringify(...)) before but it is 8x slower


    if (instanceMetaData) {
      // Add calibrated pixel spacing
      const metadata = DicomMetaDictionary.naturalizeDataset(instanceMetaData);



    }
  });

  // we don't want to add non-pet
  // Note: for 99% of scanners SUV calculation is consistent bw slices
   
    

  return imageIds;
}
export { createImageIdsAndCacheMetaData };