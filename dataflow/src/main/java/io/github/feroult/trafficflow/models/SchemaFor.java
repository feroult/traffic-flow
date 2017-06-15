package io.github.feroult.trafficflow.models;

import com.google.api.services.bigquery.model.TableFieldSchema;
import com.google.api.services.bigquery.model.TableSchema;

import java.util.ArrayList;
import java.util.List;

public class SchemaFor {

    public static TableSchema event() {
        List<TableFieldSchema> fields = new ArrayList<>();
        fields.add(new TableFieldSchema().setName("simulationId").setType("STRING").setMode("REQUIRED"));
        fields.add(new TableFieldSchema().setName("vehicleId").setType("STRING").setMode("REQUIRED"));
        fields.add(new TableFieldSchema().setName("timestamp").setType("TIMESTAMP").setMode("REQUIRED"));
        fields.add(new TableFieldSchema().setName("speed").setType("FLOAT").setMode("REQUIRED"));
        fields.add(new TableFieldSchema().setName("lat").setType("FLOAT").setMode("REQUIRED"));
        fields.add(new TableFieldSchema().setName("lng").setType("FLOAT").setMode("REQUIRED"));
        TableSchema schema = new TableSchema().setFields(fields);
        return schema;
    }

}