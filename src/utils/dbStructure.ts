
// This file represents the database structure that would be used in a PHP backend
// In a real implementation, this would be SQL scripts executed on a MySQL server

/*
-- Database structure for PON Monitoring System

-- Create database
CREATE DATABASE IF NOT EXISTS pon_monitoring;
USE pon_monitoring;

-- Devices table
CREATE TABLE devices (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    community_string VARCHAR(255) NOT NULL,
    model VARCHAR(100),
    firmware_version VARCHAR(50),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_ip_address (ip_address)
);

-- Signal levels table
CREATE TABLE signal_levels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(36) NOT NULL,
    port INT NOT NULL,
    level_dbm DECIMAL(5,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_device_port (device_id, port),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

-- Line length table
CREATE TABLE line_lengths (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(36) NOT NULL,
    port INT NOT NULL,
    length_km DECIMAL(6,3) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_device_port (device_id, port),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

-- MAC addresses table
CREATE TABLE mac_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(36) NOT NULL,
    port INT NOT NULL,
    mac_address VARCHAR(17) NOT NULL,
    vendor VARCHAR(100),
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    INDEX idx_device_port (device_id, port),
    INDEX idx_mac (mac_address),
    UNIQUE KEY idx_device_mac (device_id, mac_address),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

-- Traffic statistics table
CREATE TABLE traffic_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(36) NOT NULL,
    port INT NOT NULL,
    rx_bytes BIGINT UNSIGNED NOT NULL,
    tx_bytes BIGINT UNSIGNED NOT NULL,
    rx_packets BIGINT UNSIGNED,
    tx_packets BIGINT UNSIGNED,
    rx_errors INT UNSIGNED,
    tx_errors INT UNSIGNED,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_device_port (device_id, port),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

-- Traffic history for long-term storage (aggregated)
CREATE TABLE traffic_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(36) NOT NULL,
    port INT NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    rx_bytes_total BIGINT UNSIGNED NOT NULL,
    tx_bytes_total BIGINT UNSIGNED NOT NULL,
    rx_rate_avg DECIMAL(10,2) NOT NULL, -- Mbps
    tx_rate_avg DECIMAL(10,2) NOT NULL, -- Mbps
    rx_rate_max DECIMAL(10,2), -- Mbps
    tx_rate_max DECIMAL(10,2), -- Mbps
    INDEX idx_device_port (device_id, port),
    INDEX idx_period (period_start, period_end),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

-- PON parameters table for additional metrics
CREATE TABLE pon_parameters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(36) NOT NULL,
    port INT NOT NULL,
    parameter_name VARCHAR(100) NOT NULL,
    parameter_value VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_device_port (device_id, port),
    INDEX idx_param_name (parameter_name),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

-- Events table for logging important changes
CREATE TABLE events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(36) NOT NULL,
    port INT,
    event_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP NULL,
    INDEX idx_device (device_id),
    INDEX idx_type_severity (event_type, severity),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

-- ONU devices table (end-user equipment)
CREATE TABLE onu_devices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(36) NOT NULL, -- OLT device ID
    port INT NOT NULL,
    onu_id INT NOT NULL,
    serial_number VARCHAR(100),
    model VARCHAR(100),
    firmware_version VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    last_online TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_device_port (device_id, port),
    UNIQUE KEY idx_device_port_onu (device_id, port, onu_id),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

-- Create triggers for traffic rate calculations
DELIMITER //

-- Trigger to calculate traffic rates when new stats are inserted
CREATE TRIGGER calculate_traffic_rates
AFTER INSERT ON traffic_stats
FOR EACH ROW
BEGIN
    DECLARE prev_rx BIGINT;
    DECLARE prev_tx BIGINT;
    DECLARE prev_time TIMESTAMP;
    DECLARE time_diff_sec INT;
    DECLARE rx_rate DECIMAL(10,2);
    DECLARE tx_rate DECIMAL(10,2);
    
    -- Get previous stats
    SELECT rx_bytes, tx_bytes, timestamp INTO prev_rx, prev_tx, prev_time
    FROM traffic_stats
    WHERE device_id = NEW.device_id AND port = NEW.port
      AND id != NEW.id
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- Calculate rates if previous data exists
    IF prev_rx IS NOT NULL THEN
        SET time_diff_sec = TIMESTAMPDIFF(SECOND, prev_time, NEW.timestamp);
        
        -- Only calculate if time difference is positive and not too long (to avoid skewed data)
        IF time_diff_sec > 0 AND time_diff_sec < 3600 THEN
            -- Calculate rate in Mbps (bytes to bits, then to Mbps)
            SET rx_rate = ((NEW.rx_bytes - prev_rx) * 8) / (time_diff_sec * 1000000);
            SET tx_rate = ((NEW.tx_bytes - prev_tx) * 8) / (time_diff_sec * 1000000);
            
            -- Insert into PON parameters table
            INSERT INTO pon_parameters (device_id, port, parameter_name, parameter_value, timestamp)
            VALUES 
                (NEW.device_id, NEW.port, 'rx_rate_mbps', rx_rate, NEW.timestamp),
                (NEW.device_id, NEW.port, 'tx_rate_mbps', tx_rate, NEW.timestamp);
        END IF;
    END IF;
END //

DELIMITER ;

-- Stored procedure for aggregating traffic data for historical storage
DELIMITER //

CREATE PROCEDURE aggregate_traffic_history(IN hours_to_aggregate INT)
BEGIN
    DECLARE cutoff_time TIMESTAMP;
    SET cutoff_time = DATE_SUB(NOW(), INTERVAL hours_to_aggregate HOUR);
    
    -- Insert aggregated records
    INSERT INTO traffic_history (
        device_id, port, period_start, period_end,
        rx_bytes_total, tx_bytes_total,
        rx_rate_avg, tx_rate_avg,
        rx_rate_max, tx_rate_max
    )
    SELECT 
        device_id, 
        port,
        MIN(timestamp) AS period_start,
        MAX(timestamp) AS period_end,
        MAX(rx_bytes) - MIN(rx_bytes) AS rx_bytes_total,
        MAX(tx_bytes) - MIN(tx_bytes) AS tx_bytes_total,
        AVG(
            (SELECT parameter_value 
             FROM pon_parameters 
             WHERE parameter_name = 'rx_rate_mbps'
               AND pon_parameters.device_id = traffic_stats.device_id
               AND pon_parameters.port = traffic_stats.port
               AND pon_parameters.timestamp = traffic_stats.timestamp)
        ) AS rx_rate_avg,
        AVG(
            (SELECT parameter_value 
             FROM pon_parameters 
             WHERE parameter_name = 'tx_rate_mbps'
               AND pon_parameters.device_id = traffic_stats.device_id
               AND pon_parameters.port = traffic_stats.port
               AND pon_parameters.timestamp = traffic_stats.timestamp)
        ) AS tx_rate_avg,
        MAX(
            (SELECT parameter_value 
             FROM pon_parameters 
             WHERE parameter_name = 'rx_rate_mbps'
               AND pon_parameters.device_id = traffic_stats.device_id
               AND pon_parameters.port = traffic_stats.port
               AND pon_parameters.timestamp = traffic_stats.timestamp)
        ) AS rx_rate_max,
        MAX(
            (SELECT parameter_value 
             FROM pon_parameters 
             WHERE parameter_name = 'tx_rate_mbps'
               AND pon_parameters.device_id = traffic_stats.device_id
               AND pon_parameters.port = traffic_stats.port
               AND pon_parameters.timestamp = traffic_stats.timestamp)
        ) AS tx_rate_max
    FROM traffic_stats
    WHERE timestamp < cutoff_time
    GROUP BY device_id, port, 
             YEAR(timestamp), MONTH(timestamp), DAY(timestamp), HOUR(timestamp);
    
    -- Delete aggregated raw data
    DELETE FROM traffic_stats WHERE timestamp < cutoff_time;
    
    -- Delete related PON parameters that were aggregated
    DELETE FROM pon_parameters 
    WHERE parameter_name IN ('rx_rate_mbps', 'tx_rate_mbps') 
      AND timestamp < cutoff_time;
END //

DELIMITER ;

-- Create Event Scheduler for regular aggregation
DELIMITER //

CREATE EVENT aggregate_daily_traffic
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
BEGIN
    -- Aggregate data older than 24 hours
    CALL aggregate_traffic_history(24);
END //

DELIMITER ;

-- Sample indexing strategy for optimization
CREATE INDEX idx_signal_levels_recent ON signal_levels (device_id, port, timestamp);
CREATE INDEX idx_traffic_recent ON traffic_stats (device_id, port, timestamp);
CREATE INDEX idx_mac_addr_lookup ON mac_addresses (mac_address, status);
*/

export {};
