const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const { env } = require("process");

const prisma = new PrismaClient();
const apiKey = env("X_ELS_APIKey");

const headers = {
  Accept: "application/json",
  "X-ELS-APIKey": apiKey,
};

async function fetchAndSaveAllData() {
  let startIndex = 0;
  const countPerPage = 25; // Adjust as needed and max at 25

  try {
    while (true) {
      const response = await axios.get(
        `https://api.elsevier.com/content/search/scopus?query=af-id(60020524)&start=${startIndex}&count=${countPerPage}`,
        {
          headers,
        }
      );

      const entries = response.data["search-results"]["entry"];

      // !response.data["search-results"]["link"].find(
      //   (link) => link["@ref"] === "next"
      // )

      // Break the loop if there are no more entries
      if (!entries || entries.length === 0) {
        break;
      }

      // Process and save each entry
      for (const entry of entries) {
        const scopusIdParts = entry["dc:identifier"]?.split(":") || [];
        const actualScopusId = scopusIdParts[1] || null;

        const affiliations = entry.affiliation || [];

        // Create the ScopusEntry with basic data
        const createdEntry = await prisma.scopusEntry.create({
          data: {
            scopusId: actualScopusId,
            title: entry["dc:title"] || null,
            creator: entry["dc:creator"] || null,
            publicationName: entry["prism:publicationName"] || null,
            issn: entry["prism:issn"] || null,
            volume: entry["prism:volume"] || null,
            pageRange: entry["prism:pageRange"] || null,
            coverDate: entry["prism:coverDate"]
              ? new Date(entry["prism:coverDate"])
              : null,
            doi: entry["prism:doi"] || null,
            pii: entry["pii"] || null,
            citedByCount: entry["citedby-count"]
              ? parseInt(entry["citedby-count"], 10)
              : null,
            aggregationType: entry["prism:aggregationType"] || null,
            subtype: entry["subtype"] || null,
            subtypeDescription: entry["subtypeDescription"] || null,
            articleNumber: entry["article-number"] || null,
            sourceId: entry["source-id"] || null,
            openaccess: entry["openaccess"]
              ? parseInt(entry["openaccess"], 10)
              : null,
            openaccessFlag: entry["openaccessFlag"] || null,
            affiliations: {
              create: affiliations.map((affiliation) => ({
                affilname: affiliation["affilname"],
                affiliationCity: affiliation["affiliation-city"],
                affiliationCountry: affiliation["affiliation-country"],
              })),
            },
          },
        });

        // Make additional request to get detailed data
        const scopusDetailResponse = await axios.get(
          `https://api.elsevier.com/content/abstract/scopus_id/${actualScopusId}`,
          {
            headers,
          }
        );
        const scopusDetailData =
          scopusDetailResponse.data["abstracts-retrieval-response"];

        // Update the created entry with additional data

        const firstCreator =
          scopusDetailData["coredata"]["dc:creator"]["author"][0] || {};
        const creatorGivenName = firstCreator["ce:given-name"] || null;
        const creatorSurname = firstCreator["ce:surname"] || null;
        const creatorInitials = firstCreator["ce:initials"] || null;
        const creatorIndexedName = firstCreator["ce:indexed-name"] || null;

        console.log(firstCreator);

        await prisma.scopusEntry.update({
          where: { id: createdEntry.id },
          data: {
            // Add more fields from scopusDetailData
            prismUrl: scopusDetailData["coredata"]["prism:url"] || null,
            scopusUrl:
              scopusDetailData["coredata"]["link"].find(
                (link) => link["@rel"] === "scopus"
              )?.["@href"] || null,
            scopusCitedByUrl:
              scopusDetailData["coredata"]["link"].find(
                (link) => link["@rel"] === "scopus-citedby"
              )?.["@href"] || null,
            eid: scopusDetailData["coredata"]["eid"] || null,
            srctype: scopusDetailData["coredata"]["srctype"] || null,
            prismCoverDate:
              scopusDetailData["coredata"]["prism:coverDate"] || null,
            prismAggregationType:
              scopusDetailData["coredata"]["prism:aggregationType"] || null,
            subtypeDescription:
              scopusDetailData["coredata"]["subtypeDescription"] || null,
            dcPublisher: scopusDetailData["coredata"]["dc:publisher"] || null,
            prismIssn: scopusDetailData["coredata"]["prism:issn"] || null,
            articleNumber:
              scopusDetailData["coredata"]["article-number"] || null,
            dcIdentifier: scopusDetailData["coredata"]["dc:identifier"] || null,
            creatorGivenName,
            creatorSurname,
            creatorInitials,
            creatorIndexedName,
          },
        });
      }

      // Move to the next page
      startIndex += countPerPage;

      console.log(startIndex);
    }

    console.log("All data collected and saved successfully!");
  } catch (error) {
    console.error("Error fetching or saving data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fetchAndSaveAllData();
