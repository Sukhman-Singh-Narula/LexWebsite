// src/services/courtApiService.ts
import axios from 'axios';

const API_BASE_URL = 'https://apis.akshit.net/eciapi/17';

export interface CourtCaseDetails {
    _id: string;
    cnr: string;
    title: string;
    details: {
        type: string;
        filingNumber: string;
        filingDate: string;
        registrationNumber: string;
        registrationDate: string;
    };
    status: {
        firstHearingDate: string;
        nextHearingDate: string;
        decisionDate: string;
        natureOfDisposal: string;
        caseStage: string;
        courtNumberAndJudge: string;
    };
    parties: {
        petitioners: string[];
        respondents: string[];
        petitionerAdvocates: string[];
        respondentAdvocates: string[];
    };
    actsAndSections: {
        acts: string;
        sections: string;
    };
    firstInformationReport?: {
        policeStation: string;
        firNumber: string;
        year: string;
    };
    history: any[];
    orders: any[];
}

const courtApiService = {
    async fetchDistrictCourtCase(cnr: string): Promise<CourtCaseDetails> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/district-court/case`,
                { cnr },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        // You'll need to add your API key here
                        'X-API-Key': process.env.COURT_API_KEY || '',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching district court case:', error);
            throw error;
        }
    },

    async fetchHighCourtCase(cnr: string): Promise<CourtCaseDetails> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/high-court/case`,
                { cnr },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': process.env.COURT_API_KEY || '',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching high court case:', error);
            throw error;
        }
    },

    async fetchSupremeCourtCase(diaryNumber: string, year: string): Promise<CourtCaseDetails> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/supreme-court/case`,
                { diaryNumber, year },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': process.env.COURT_API_KEY || '',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching supreme court case:', error);
            throw error;
        }
    },

    async searchPartyByName(name: string, year: string, complexId?: string): Promise<any> {
        try {
            const payload: any = {
                name,
                stage: "BOTH",
                year
            };

            if (complexId) {
                payload.complexId = complexId;
            }

            const response = await axios.post(
                `${API_BASE_URL}/district-court/search/party`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': process.env.COURT_API_KEY || '',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error searching party by name:', error);
            throw error;
        }
    }
};

export default courtApiService;