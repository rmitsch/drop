import Panel from "./Panel.js";
import Utils from "../Utils.js";
import Table from "../charts/ModelOverviewTable.js"

/**
 * Panel holding table for selection of models in operator FilterReduce.
 */
export default class FilterReduceTablePanel extends Panel
{
    /**
     * Constructs new FilterReduce table panel.
     * @param name
     * @param operator
     * @param parentDivID
     */
    constructor(name, operator, parentDivID)
    {
        super(name, operator, parentDivID);

        // Update involved CSS classes.
        $("#" + this._target).addClass("filter-reduce-table-panel");

        // Initialize div structure.
        this._divStructure = this._createDivStructure();

        // Generate table.
        let table = new Table(
            "Model selection table",
            this,
            Utils.unfoldHyperparameterObjectList(
                this._operator.dataset.metadata.hyperparameters
            ).concat(this._operator.dataset.metadata.objectives),
            this._operator.dataset,
            null,
            this._target
        );
        this._charts[table.name] = table;
    }

    get table()
    {
        return this._charts["Model selection table"];
    }

    /**
     * Create (hardcoded) div structure for child nodes.
     * @returns {Object}
     */
    _createDivStructure()
    {
        console.log("div structure")
        let infoDiv = Utils.spawnChildDiv(this._target, null, "panel-info");
        $("#" + infoDiv.id).html(
            "<span class='title'>All embeddings</span>" +
            "<a id='filter-reduce-table-info-settings-icon' href='#'>" +
            "    <img src='./static/img/icon_settings.png' class='info-icon' alt='Settings' width='20px'>" +
            "</a>"
        );

        return {
          infoDivID: infoDiv.id
        };
    }
}