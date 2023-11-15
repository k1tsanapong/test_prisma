-- CreateTable
CREATE TABLE "ScopusEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scopusId" TEXT,
    "title" TEXT,
    "creatorGivenName" TEXT,
    "creatorSurname" TEXT,
    "creatorInitials" TEXT,
    "creatorIndexedName" TEXT,
    "creator" TEXT,
    "coverDate" DATETIME,
    "doi" TEXT,
    "pii" TEXT,
    "citedByCount" INTEGER,
    "aggregationType" TEXT,
    "subtype" TEXT,
    "subtypeDescription" TEXT,
    "articleNumber" TEXT,
    "sourceId" TEXT,
    "openaccess" INTEGER,
    "openaccessFlag" BOOLEAN,
    "publicationName" TEXT,
    "issn" TEXT,
    "volume" TEXT,
    "prismUrl" TEXT,
    "scopusUrl" TEXT,
    "scopusCitedByUrl" TEXT,
    "eid" TEXT,
    "srctype" TEXT,
    "prismCoverDate" TEXT,
    "prismAggregationType" TEXT,
    "dcPublisher" TEXT,
    "prismIssn" TEXT,
    "dcIdentifier" TEXT,
    "pageRange" TEXT
);

-- CreateTable
CREATE TABLE "Affiliation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "affilname" TEXT,
    "affiliationCity" TEXT,
    "affiliationCountry" TEXT,
    "scopusEntryId" INTEGER,
    CONSTRAINT "Affiliation_scopusEntryId_fkey" FOREIGN KEY ("scopusEntryId") REFERENCES "ScopusEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
