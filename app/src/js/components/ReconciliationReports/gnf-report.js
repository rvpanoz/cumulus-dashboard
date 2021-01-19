import PropTypes from 'prop-types';
import React from 'react';
import groupBy from 'lodash/groupBy';
import {
  searchReconciliationReport,
  clearReconciliationSearch,
} from '../../actions';
import SortableTable from '../SortableTable/SortableTable';
import Search from '../Search/search';
import ReportHeading from './report-heading';
import { handleDownloadJsonClick } from '../../utils/download-file';
import { tableColumnsGnf } from '../../utils/table-config/reconciliation-reports';
import { getFilesSummary, getGranuleFilesSummary } from './reshape-report';
import { getCollectionId } from '../../utils/format';

const GnfReport = ({
  filterString,
  legend,
  recordData,
  reportName,
}) => {
  const {
    filesInCumulus,
    granulesInCumulusCmr,
    filesInCumulusCmr,
    createStartTime = null,
    createEndTime = null,
    error = null
  } = recordData || {};

  const { filesInDynamoDb } = getFilesSummary(filesInCumulus);
  const { granuleFilesOnlyInCumulus, granuleFilesOnlyInCmr } = getGranuleFilesSummary(filesInCumulusCmr);

  const { onlyInCmr = [], onlyInCumulus = [] } = granulesInCumulusCmr;

  const cmrGranules = onlyInCmr.map((granule) => {
    const { GranuleUR, ShortName, Version } = granule;
    return {
      ...granule,
      granuleId: GranuleUR,
      collectionId: getCollectionId({ name: ShortName, version: Version }),
      cmr: true,
      cumulus: false,
      s3: false,
    };
  });

  const cumulusGranules = onlyInCumulus.map((granule) => ({
    ...granule,
    cmr: false,
    cumulus: true,
  }));

  const allGranules = [
    ...filesInDynamoDb,
    ...granuleFilesOnlyInCmr,
    ...granuleFilesOnlyInCumulus,
    ...cmrGranules,
    ...cumulusGranules
  ];

  const groupedGranules = groupBy(allGranules, 'granuleId');

  let combinedGranules = Object.entries(groupedGranules).map(([key, value]) => value.reduce((prev, curr) => ({
    ...prev,
    ...curr,
  }), {}));

  if (filterString) {
    combinedGranules = combinedGranules.filter((granule) => granule.granuleId.toLowerCase()
      .includes(filterString.toLowerCase()));
  }

  function calculateMissingGranules(totalMissing, currentGranuleData) {
    const { s3, cumulus, cmr } = currentGranuleData;
    const missingS3 = s3 === false || (typeof s3 === 'string' && s3.match(/^(notFound|missing)$/)) ? 1 : 0;
    const missingCumulus = cumulus === false || (typeof cumulus === 'string' && cumulus.match(/^(notFound|missing)$/)) ? 1 : 0;
    const missingCmr = cmr === false || (typeof cmr === 'string' && cmr.match(/^(notFound|missing)$/)) ? 1 : 0;

    return totalMissing + missingS3 + missingCumulus + missingCmr;
  }

  const totalMissingGranules = combinedGranules.reduce(calculateMissingGranules, 0);

  function handleDownloadClick(e) {
    handleDownloadJsonClick(e, { data: recordData, reportName });
  }

  return (
    <div className="page__component">
      <ReportHeading
        conflictComparisons={totalMissingGranules}
        endTime={createEndTime}
        error={error}
        name={reportName}
        onDownloadClick={handleDownloadClick}
        startTime={createStartTime}
        type='Granule Not Found'
      />
      <section className="page__section">
        <div className="list-action-wrapper">
          <Search
            action={searchReconciliationReport}
            clear={clearReconciliationSearch}
            label="Search"
            labelKey="granuleId"
            options={combinedGranules}
            placeholder="Search"
          />
        </div>
        <SortableTable
          data={combinedGranules}
          tableColumns={tableColumnsGnf}
          shouldUsePagination={true}
          initialHiddenColumns={['']}
          legend={legend}
        />
      </section>
    </div>
  );
};

GnfReport.propTypes = {
  filterString: PropTypes.string,
  legend: PropTypes.node,
  recordData: PropTypes.object,
  reportName: PropTypes.string,
};

export default GnfReport;
