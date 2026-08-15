import { useContext } from "react";
import { InterviewContext } from "../interview.context";
import type { REPORTLISTTYPE } from "../types";

export const useInterview: () => [REPORTLISTTYPE[], React.Dispatch<React.SetStateAction<REPORTLISTTYPE[]>>, boolean] = () => {
    const context = useContext(InterviewContext);
    if (!context) {
        throw new Error("useInterview must ne used within a InterviewProvider");
    }
    return context;
}