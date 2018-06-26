import Panel from "./Panel.js";
import Utils from "../Utils.js";
import Dataset from "../Dataset.js";

/**
 * Panel holding elements for comparison of inter-model disagreement for datapoints
 * in selected model instances.
 */
export default class DissonancePanel extends Panel
{
    /**
     * Constructs new panel for charts for DissonanceOperator.
     * @param name
     * @param operator
     * @param parentDivID
     */
    constructor(name, operator, parentDivID)
    {
        super(name, operator, parentDivID);

        // Update involved CSS classes.
        $("#" + this._target).addClass("dissonance-panel");

        // Create div structure for child nodes.
        this._divStructure = this._createDivStructure();

        // Generate charts.
        this._generateCharts();
    }

    /**
     * Generates all chart objects. Does _not_ render them.
     */
    _generateCharts()
    {
        console.log("Generating DissonancePanel...");

        // Fetch reference to dataset.
        let dataset = this._operator._dataset;
    }

    /**
     * Create (hardcoded) div structure for child nodes.
     * @returns {Object}
     */
    _createDivStructure()
    {

    }
}