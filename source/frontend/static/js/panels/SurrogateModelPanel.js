import Panel from "./Panel.js";
import Utils from "../Utils.js";
import Dataset from "../Dataset.js";

/**
 * Panel holding charts for surrogate model in SurrogateModelOperator.
 */
export default class SurrogateModelPanel extends Panel
{
    /**
     * Constructs new FilterReduce charts panel.
     * @param name
     * @param operator
     * @param parentDivID
     */
    constructor(name, operator, parentDivID)
    {
        super(name, operator, parentDivID);

        // Update involved CSS classes.
        $("#" + this._target).addClass("surrogate-model-panel");

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
        console.log("Generating SurrogateModelPanel...");

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