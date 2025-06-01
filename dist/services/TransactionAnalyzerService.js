"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionAnalyzerService = void 0;
const ethers_1 = require("ethers");
class TransactionAnalyzerService {
    constructor() {
        // Constructor can be used for any setup if needed later
    }
    analyzeTransactions(transactions, walletAddress, currentEthPriceUsd, startDate, // New optional parameter
    endDate // New optional parameter
    ) {
        var _a;
        let filteredTransactions = transactions;
        let dateFilterApplied = false;
        if (startDate || endDate) {
            dateFilterApplied = true;
            const startTimeInSeconds = startDate ? new Date(startDate).setHours(0, 0, 0, 0) / 1000 : 0;
            const endTimeInSeconds = endDate ? new Date(endDate).setHours(23, 59, 59, 999) / 1000 : Infinity;
            let sliceStartIndex = 0;
            let sliceEndIndex = transactions.length;
            if (startDate) {
                sliceStartIndex = transactions.findIndex(tx => tx.timestamp !== undefined && tx.timestamp !== null && tx.timestamp >= startTimeInSeconds);
                if (sliceStartIndex === -1) { // All transactions are before startDate
                    sliceStartIndex = transactions.length; // This will result in an empty slice
                }
            }
            if (endDate) {
                // Search for the first transaction *after* the endTimeInSeconds, but only in the relevant part of the array
                const searchArrayForEnd = transactions.slice(sliceStartIndex);
                let endIndexRelative = searchArrayForEnd.findIndex(tx => tx.timestamp !== undefined && tx.timestamp !== null && tx.timestamp > endTimeInSeconds);
                if (endIndexRelative === -1) { // All remaining transactions are within or at endDate
                    sliceEndIndex = transactions.length;
                }
                else {
                    sliceEndIndex = sliceStartIndex + endIndexRelative;
                }
            }
            // Ensure sliceStartIndex is not greater than sliceEndIndex
            if (sliceStartIndex > sliceEndIndex) {
                sliceStartIndex = sliceEndIndex;
            }
            filteredTransactions = transactions.slice(sliceStartIndex, sliceEndIndex);
            console.log(`[TransactionAnalyzerService] Applied date filter: ${(startDate === null || startDate === void 0 ? void 0 : startDate.toISOString().split('T')[0]) || 'N/A'} to ${(endDate === null || endDate === void 0 ? void 0 : endDate.toISOString().split('T')[0]) || 'N/A'}. ${filteredTransactions.length} of ${transactions.length} txs selected using optimized slice.`);
        }
        if (!filteredTransactions || filteredTransactions.length === 0) {
            console.warn('[TransactionAnalyzerService] No transactions provided or remaining after date filter for analysis.');
            return { transactionCountInDateRange: 0 };
        }
        // --- START DEBUG LOGGING (uses filteredTransactions) ---
        console.log(`[TransactionAnalyzerService] Analyzing ${filteredTransactions.length} transactions for address ${walletAddress} (after potential date filter)`);
        if (filteredTransactions.length > 0) {
            // console.log('[TransactionAnalyzerService] Sample transaction (first one from filtered list):', JSON.stringify(filteredTransactions[0], null, 2));
            // Minimal log to avoid too much verbosity if filtered list is still large
            if ((_a = filteredTransactions[0]) === null || _a === void 0 ? void 0 : _a.raw) {
                console.log(`[TransactionAnalyzerService] Sample filtered TX hash: ${filteredTransactions[0].hash}, timestamp: ${new Date(filteredTransactions[0].timestamp * 1000).toISOString()}`);
            }
        }
        // --- END DEBUG LOGGING ---
        const lowerCaseWalletAddress = walletAddress.toLowerCase();
        // Helper to safely get a lowercase address string
        const getLcAddress = (field) => {
            if (!field)
                return null;
            if (typeof field === 'string')
                return field.toLowerCase();
            // Check for Moralis EvmAddress-like object
            if (field.lowercase && typeof field.lowercase === 'string')
                return field.lowercase;
            // Fallback for objects with a value property that is a string (e.g. from older SDKs or direct _value access)
            if (field.value && typeof field.value === 'string')
                return field.value.toLowerCase();
            if (field._value && typeof field._value === 'string')
                return field._value.toLowerCase(); // As seen in some logs
            // Generic toString fallback - use with caution
            // if (typeof field.toString === 'function') {
            //   try { return field.toString().toLowerCase(); } catch { return null; }
            // }
            console.warn('[TransactionAnalyzerService] Could not determine address string from field:', field);
            return null;
        };
        const totalInboundTransactions = filteredTransactions.filter((tx) => {
            var _a, _b;
            const lcTo = getLcAddress((_a = tx.raw) === null || _a === void 0 ? void 0 : _a.to);
            const lcFrom = getLcAddress((_b = tx.raw) === null || _b === void 0 ? void 0 : _b.from);
            return lcTo === lowerCaseWalletAddress && lcFrom !== null && lcFrom !== lowerCaseWalletAddress;
        }).length;
        const totalOutboundTransactions = filteredTransactions.filter((tx) => {
            var _a, _b;
            const lcFrom = getLcAddress((_a = tx.raw) === null || _a === void 0 ? void 0 : _a.from);
            const lcTo = getLcAddress((_b = tx.raw) === null || _b === void 0 ? void 0 : _b.to);
            return lcFrom === lowerCaseWalletAddress && lcTo !== null && lcTo !== lowerCaseWalletAddress;
        }).length;
        const totalContractCreationTransactions = filteredTransactions.filter((tx) => {
            var _a, _b;
            const toField = (_a = tx.raw) === null || _a === void 0 ? void 0 : _a.to;
            let isToEffectivelyNullOrZero = false;
            if (toField === null || toField === '') { // Handles explicit null or empty string
                isToEffectivelyNullOrZero = true;
            }
            else {
                const lcToForContract = getLcAddress(toField);
                // Check if it's the zero address
                if (lcToForContract === '0x0000000000000000000000000000000000000000') {
                    isToEffectivelyNullOrZero = true;
                }
            }
            return isToEffectivelyNullOrZero && ((_b = tx.raw) === null || _b === void 0 ? void 0 : _b.receiptContractAddress); // receiptContractAddress indicates success
        }).length;
        const totalFailedTransactions = filteredTransactions.filter((tx) => { var _a; return ((_a = tx.raw) === null || _a === void 0 ? void 0 : _a.receiptStatus) === 0; } // Corrected to check for number 0
        ).length;
        let cumulativeGasFeesEth = 0;
        let cumulativeGasPriceGwei = 0;
        let successfulTransactionsCountForGasAvg = 0;
        let mostExpensiveTxHash_temp = undefined;
        let mostExpensiveTxFeeEth_temp = 0;
        const txCountByDayOfWeek_temp = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const txCountByHourOfDay_temp = {};
        for (let i = 0; i < 24; i++)
            txCountByHourOfDay_temp[i] = 0;
        const uniqueInteractedAddresses_temp = new Set();
        const interactedAddressCounts_temp = new Map();
        // Helper to safely get a BigInt value for gas fields
        const getGasBigIntValue = (field) => {
            if (field === null || field === undefined)
                return null;
            if (typeof field === 'bigint')
                return field; // Already a bigint
            // Check for Moralis BigNumber-like object { value: bigint }
            if (typeof field === 'object' && field.value !== undefined && typeof field.value === 'bigint') {
                return field.value;
            }
            // Check for string or number that can be converted
            if (typeof field === 'string' || typeof field === 'number') {
                try {
                    // Ensure no empty strings or problematic formats before BigInt conversion
                    if (String(field).trim() === '')
                        return null;
                    return BigInt(field);
                }
                catch (e) {
                    console.warn(`[TransactionAnalyzerService] Could not parse gas field to BigInt: '${field}'`, e);
                    return null;
                }
            }
            // Check for Moralis BigNumber-like object { value: string/number that can be converted }
            if (typeof field === 'object' && field.value !== undefined && (typeof field.value === 'string' || typeof field.value === 'number')) {
                try {
                    if (String(field.value).trim() === '')
                        return null;
                    return BigInt(field.value);
                }
                catch (e) {
                    console.warn(`[TransactionAnalyzerService] Could not parse gas field.value to BigInt: '${field.value}'`, e);
                    return null;
                }
            }
            console.warn(`[TransactionAnalyzerService] Unknown type for gas value, cannot convert to BigInt: ${typeof field}`, field);
            return null;
        };
        filteredTransactions.forEach((tx) => {
            var _a, _b;
            if (tx.raw && tx.raw.receiptStatus === 1) { // Only process successful transactions for gas
                const gasPriceWei_val = getGasBigIntValue(tx.raw.gasPrice);
                const gasUsed_val = getGasBigIntValue(tx.raw.gasUsed);
                if (gasPriceWei_val !== null && gasUsed_val !== null) {
                    try {
                        const gasPriceWei = gasPriceWei_val;
                        const gasUsed = gasUsed_val;
                        const transactionFeeWei = gasPriceWei * gasUsed;
                        const transactionFeeEth = parseFloat(ethers_1.ethers.formatEther(transactionFeeWei));
                        cumulativeGasFeesEth += transactionFeeEth;
                        if (transactionFeeEth > mostExpensiveTxFeeEth_temp) {
                            mostExpensiveTxFeeEth_temp = transactionFeeEth;
                            mostExpensiveTxHash_temp = tx.hash;
                        }
                        const gasPriceGwei = parseFloat(ethers_1.ethers.formatUnits(gasPriceWei, 'gwei'));
                        cumulativeGasPriceGwei += gasPriceGwei;
                        successfulTransactionsCountForGasAvg++;
                    }
                    catch (e) {
                        console.warn(`[TransactionAnalyzerService] Error processing gas for tx ${tx.hash}:`, e, "Transaction raw data:", JSON.stringify(tx.raw, null, 2));
                    }
                }
            }
            // For temporal analysis, process all transactions in the filtered list
            if (tx.timestamp) {
                const txDate = new Date(tx.timestamp * 1000);
                const dayOfWeek = txDate.toLocaleString('en-US', { weekday: 'short' }); // Mon, Tue, etc.
                txCountByDayOfWeek_temp[dayOfWeek]++;
                const hourOfDay = txDate.getHours(); // 0-23
                txCountByHourOfDay_temp[hourOfDay]++;
            }
            // For counterparty analysis
            const lcFrom = getLcAddress((_a = tx.raw) === null || _a === void 0 ? void 0 : _a.from);
            const lcTo = getLcAddress((_b = tx.raw) === null || _b === void 0 ? void 0 : _b.to);
            if (lcFrom && lcFrom !== lowerCaseWalletAddress) {
                uniqueInteractedAddresses_temp.add(lcFrom);
                interactedAddressCounts_temp.set(lcFrom, (interactedAddressCounts_temp.get(lcFrom) || 0) + 1);
            }
            if (lcTo && lcTo !== lowerCaseWalletAddress) {
                uniqueInteractedAddresses_temp.add(lcTo);
                interactedAddressCounts_temp.set(lcTo, (interactedAddressCounts_temp.get(lcTo) || 0) + 1);
            }
        });
        const totalGasFeesPaidEth = cumulativeGasFeesEth;
        const totalGasFeesPaidUsd = cumulativeGasFeesEth * currentEthPriceUsd;
        const averageGasPriceGwei = successfulTransactionsCountForGasAvg > 0
            ? cumulativeGasPriceGwei / successfulTransactionsCountForGasAvg
            : 0;
        const mostExpensiveTxFeeUsd_temp = mostExpensiveTxFeeEth_temp * currentEthPriceUsd;
        let avgTxPerDay_temp = 0;
        let avgTxPerWeek_temp = 0;
        let avgTxPerMonth_temp = 0;
        if (filteredTransactions.length > 0) {
            const firstTxTimestamp = filteredTransactions[0].timestamp;
            const lastTxTimestamp = filteredTransactions[filteredTransactions.length - 1].timestamp;
            if (firstTxTimestamp && lastTxTimestamp && lastTxTimestamp >= firstTxTimestamp) {
                const spanInSeconds = lastTxTimestamp - firstTxTimestamp;
                const spanInDays = Math.max(1, spanInSeconds / (60 * 60 * 24)); // Min 1 day to avoid division by zero for same-day txs
                const spanInWeeks = Math.max(1, spanInDays / 7); // Min 1 week
                const spanInMonths = Math.max(1, spanInDays / 30.4375); // Average days in month, min 1 month
                avgTxPerDay_temp = filteredTransactions.length / spanInDays;
                avgTxPerWeek_temp = filteredTransactions.length / spanInWeeks;
                avgTxPerMonth_temp = filteredTransactions.length / spanInMonths;
            }
            else if (filteredTransactions.length === 1) {
                // If only one transaction, consider it as 1 tx per day/week/month for that single point in time.
                avgTxPerDay_temp = 1;
                avgTxPerWeek_temp = 1;
                avgTxPerMonth_temp = 1;
            }
        }
        const uniqueInteractedAddressesCount_val = uniqueInteractedAddresses_temp.size;
        const topInteractedAddresses_val = Array.from(interactedAddressCounts_temp.entries())
            .map(([address, count]) => ({ address, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        const analysisResult = {
            totalInboundTransactions,
            totalOutboundTransactions,
            totalContractCreationTransactions,
            totalFailedTransactions,
            totalGasFeesPaidEth,
            totalGasFeesPaidUsd,
            averageGasPriceGwei,
            mostExpensiveTxHash: mostExpensiveTxHash_temp,
            mostExpensiveTxFeeEth: mostExpensiveTxFeeEth_temp,
            mostExpensiveTxFeeUsd: mostExpensiveTxFeeUsd_temp,
            transactionCountInDateRange: filteredTransactions.length,
            avgTxPerDay: avgTxPerDay_temp,
            avgTxPerWeek: avgTxPerWeek_temp,
            avgTxPerMonth: avgTxPerMonth_temp,
            txCountByDayOfWeek: txCountByDayOfWeek_temp,
            txCountByHourOfDay: txCountByHourOfDay_temp,
            uniqueInteractedAddressesCount: uniqueInteractedAddressesCount_val,
            topInteractedAddresses: topInteractedAddresses_val,
        };
        console.log('[TransactionAnalyzerService] Analysis complete:', JSON.stringify(analysisResult, null, 2));
        return analysisResult;
    }
}
exports.TransactionAnalyzerService = TransactionAnalyzerService;
