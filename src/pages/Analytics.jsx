import { useEffect, useState } from "react";

const Analytics = () => {
    const [visitCount, setVisitCount] = useState(0);

    useEffect(() => {
        chrome.storage.local.get(["visitCount"], (result) => {
            setVisitCount(result.visitCount || 0);
        });
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Extension Analytics</h1>
            <p className="mt-2">Visits: {visitCount}</p>
        </div>
    );
};

export default Analytics;
