import Panel from "./Panel.js";
import Utils from "../Utils.js";
import DRMetaDataset from "../data/DRMetaDataset.js";

/**
 * Panel for model detail view.
 */
export default class ModelDetailPanel extends Panel
{
    /**
     * Constructs new panel for model detail view charts.
     * @param name
     * @param operator
     * @param parentDivID
     */
    constructor(name, operator, parentDivID)
    {
        super(name, operator, parentDivID);

        // Update involved CSS classes.
        $("#" + this._target).addClass("model-detail-panel");

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
        console.log("Generating ModelDetailPanel...");
    }

    /**
     * Create (hardcoded) div structure for child nodes.
     * @returns {Object}
     */
    _createDivStructure()
    {
        // -----------------------------------
        // 1. Create panes.
        // -----------------------------------

        // Left pane.
        let parameterPane = Utils.spawnChildDiv(this._target, "model-detail-parameter-pane", "split split-horizontal");
        // Right pane.
        let samplePane = Utils.spawnChildDiv(this._target, "model-detail-sample-pane", "split split-horizontal");

        // Upper-left pane - hyperparameters and objectives for current DR model.
        let attributePane = Utils.spawnChildDiv(
            parameterPane.id, null, "model-detail-pane split split-vertical",
            `<div class='model-details-block reduced-padding'>
                <div class='model-details-title'>Hyperparameters</div>
                <div id="model-details-block-hyperparameter-content"></div>
                <hr>
                <div class='model-details-title'>Objectives</div>
                <div id="model-details-block-objective-content"></div>
            </div>`
        );
        // Bottom-left pane - explanation of hyperparameter importance for this DR model utilizing LIME.
        let limePane = Utils.spawnChildDiv(
            parameterPane.id, null, "model-detail-pane split-vertical",
            `<div class='model-details-block'>
                <div class='model-details-title'>Local Hyperparameter Relevance</div>
            </div>`
        );

        // Upper-right pane - all records in scatterplot (SPLOM? -> What to do with higher-dim. projections?).
        let scatterplotPane = Utils.spawnChildDiv(
            samplePane.id, null, "model-detail-pane split-vertical",
            `<div class='model-details-block reduced-padding'>
                <div class='model-details-title'>All Records</div>
            </div>`
        );
        // Bottom-right pane - detailed information to currently selected record.
        let recordPane = Utils.spawnChildDiv(
            samplePane.id, null, "model-detail-pane split-vertical",
            `<div class='model-details-block'>
                <div class='model-details-title'>Selected Sample(s)</span>
            </div>`
        );

        // -----------------------------------
        // 2. Configure splitting.
        // -----------------------------------

        // Split left and right pane.
        Split(["#" + parameterPane.id, "#" + samplePane.id], {
            direction: "horizontal",
            sizes: [25, 75],
            onDragEnd: function() {}
        });

        // Split upper-left and bottom-left pane.
        Split(["#" + attributePane.id, "#" + limePane.id], {
            direction: "vertical",
            sizes: [50, 50],
            onDragEnd: function() {}
        });

        // Split upper-right and bottom-right pane.
        Split(["#" + scatterplotPane.id, "#" + recordPane.id], {
            direction: "vertical",
            sizes: [50, 50],
            onDragEnd: function() {}
        });

        // Return all panes' IDs.
        return {
            parameterPaneID: parameterPane.id,
            samplePaneID: samplePane.id,
            attributePane: {
                id: attributePane.id,
                hyperparameterContentID: "model-details-block-hyperparameter-content",
                objectiveContentID: "model-details-block-objective-content",
            },
            limePaneID: limePane.id,
            scatterplotPaneID: scatterplotPane.id,
            recordPaneID: recordPane.id
        };
    }

    render()
    {
        let scope               = this;
        let drMetaDataset       = this._operator._drMetaDataset;
        // Fetch metadata structure (i. e. attribute names and types).
        let metadataStructure   = drMetaDataset._metadata;
        let currModelID         = this._data.modelID;

        // Reset container div.
        let hyperparameterContentDiv    = $("#" + this._divStructure.attributePane.hyperparameterContentID);
        let objectiveContentDiv         = $("#" + this._divStructure.attributePane.objectiveContentID);
        hyperparameterContentDiv.html("");
        objectiveContentDiv.html("");

        // 5. todo Repeat until all attributes are covered.
        // 6. Eval. vis.

        // -------------------------------------------------------
        // 1. Gather/transform data.
        // -------------------------------------------------------

        // Gather values for bins from DRMetaDataset instance.
        let values = { hyperparameters: {}, objectives: {} };

        for (let valueType in values) {
            for (let attribute of metadataStructure[valueType]) {
                let key             = valueType === "hyperparameters" ? attribute.name : attribute;
                let bins            = drMetaDataset._cf_groups[key + "#histogram"].all();
                let binWidth        = drMetaDataset._cf_intervals[key] / drMetaDataset._binCount;

                // Iterate over bins in this group.
                let isCategorical   = valueType === "hyperparameters" && attribute.type === "categorical";

                // Build dict for this attribute.
                values[valueType][key]  = {data: [], extrema: drMetaDataset._cf_extrema[key], colors: null, tooltips: null};


                // Compile data list.
                values[valueType][key].data     = bins.map(bin => isCategorical ? bin.value : bin.value.count);

                // Compile color map.
                values[valueType][key].colors = bins.map(
                    bin => isCategorical ?
                    // If attribute is categorical: Check if bin key/title is equal to current model's attribute value.
                    (bin.key === scope._data.primitiveData.model_metadata[currModelID][key] ? "red" : "blue") :
                    // If attribute is numerical: Check if list of items in bin contains current model with this ID.
                    bin.value.items.some(item => item.id === scope._data.modelID) ? "red" : "blue"
                );

                // Compile tooltip map.
                values[valueType][key].tooltips = {};
                for (let i = 0; i < bins.length; i++) {
                    values[valueType][key].tooltips[i] = isCategorical ?
                        bins[i].key : bins[i].key.toFixed(4) + " - " + (bins[i].key + binWidth).toFixed(4);
                }
            }
        }

        // -------------------------------------------------------
        // 2. Draw charts.
        // -------------------------------------------------------

        // Draw hyperparameter charts.
        for (let valueType in values) {
            for (let attribute of metadataStructure[valueType]) {
                let key     = valueType === "hyperparameters" ? attribute.name : attribute;
                let record  = values[valueType][key];

                // Append new div for attribute.
                let chartContainerDiv   = Utils.spawnChildDiv(
                    valueType === "hyperparameters" ? hyperparameterContentDiv[0].id : objectiveContentDiv[0].id,
                    null,
                    "model-detail-sparkline-container",
                    "<div class='attr-label'>" + DRMetaDataset.translateAttributeNames()[key] + "</div>"
                );
                let chartDiv            = Utils.spawnChildDiv(chartContainerDiv.id, null, "model-detail-sparkline");

                // Draw chart.
                $("#" + chartDiv.id).sparkline(
                    record.data,
                    {
                        type: "bar",
                        barWidth: Math.min(10, 50 / record.data.length),
                        barSpacing: 1,
                        chartRangeMin: 0,
                        height: 20,
                        tooltipFormat: '{{offset:offset}}',
                        tooltipValueLookups: {'offset': record.tooltips},
                        colorMap: record.colors
                    }
                );
            }
        }

    }

    processSettingsChange(delta)
    {
    }

    /**
     * Updates dataset; re-renders charts.
     */
    update()
    {
        this._data      = this._operator._dataset;
        let data        = this._data;
        let stageDiv    = $("#" + this._operator._stage._target);

        // Show modal.
        $("#" + this._target).dialog({
            title: "Model Details for Model with ID #" + data.modelID,
            width: stageDiv.width() / 1.5,
            height: stageDiv.height() / 1.5
        });

        // Render charts.
        this.render();
    }
}