from flask import Flask, jsonify
import yfinance as yf
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)

# Load pre-trained model
model = load_model('my_model.keras')

# Function to fetch stock data
def fetch_stock_data(symbol, period="1mo"):
    stock = yf.Ticker(symbol)
    hist = stock.history(period=period)
    return hist

# Function to create sequences for prediction
def create_sequences(data, time_steps=60):
    X, y = [], []
    for i in range(len(data) - time_steps):
        X.append(data[i:i + time_steps])  # Last 60 days
        y.append(data[i + time_steps])  # Next day's price
    return np.array(X), np.array(y)

# API Endpoint: Compare actual vs predicted stock prices

@app.route("/api/compare/<symbol>/<time>", methods=["GET"])
def compare(symbol, time):
    try:
        df = fetch_stock_data(symbol, period=time)

        if df.empty:
            return jsonify({"error": "No data available for the given stock symbol"}), 404

        # Normalize the 'Close' prices
        scaler = MinMaxScaler(feature_range=(0, 1))
        df['Close_Scaled'] = scaler.fit_transform(df[['Close']])

        test_scaled = df['Close_Scaled'].values.reshape(-1, 1)

        # Create sequences
        time_steps = 60
        X_test, y_test = create_sequences(test_scaled, time_steps)

        # Ensure correct input shape
        X_test = X_test.reshape(X_test.shape[0], time_steps, 1)

        # Make predictions
        predicted_prices = model.predict(X_test)

        # Inverse transform predictions
        predicted_prices = scaler.inverse_transform(predicted_prices)
        y_test_actual = scaler.inverse_transform(y_test.reshape(-1, 1))

        # Convert results to a list for JSON response
        result = {
            "actual": y_test_actual.flatten().tolist(),
            "predicted": predicted_prices.flatten().tolist(),
            "dates": df.index[-len(y_test_actual):].astype(str).tolist()
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API Endpoint: Fetch Stock Data
@app.route("/api/stock/<symbol>", methods=["GET"])
def get_stock(symbol):
    data = fetch_stock_data(symbol)

    if data.empty:
        return jsonify({"error": "No data available for the given stock symbol"}), 404

    stock_info_data = yf.Ticker(symbol).info  # Fetch stock info

    current_price = round(data["Close"].iloc[-1], 2) if not data.empty else 0
    previous_close = stock_info_data.get("previousClose", 0)

    # Calculate percentage change
    percentage_change = (
        round(((current_price - previous_close) / previous_close) * 100, 2)
        if previous_close and previous_close > 0 else 0
    )

    stock_info = {
        "name": symbol,
        "company_name": stock_info_data.get("longName", "N/A"),
        "current_price": current_price,
        "previous_price": previous_close,
        "market_cap": round(stock_info_data.get("marketCap", 0) / 1e12, 2),
        "pe_ratio": round(stock_info_data.get("trailingPE", 0), 2),
        "high_52w": round(stock_info_data.get("fiftyTwoWeekHigh", 0), 2),
        "low_52w": round(stock_info_data.get("fiftyTwoWeekLow", 0), 2),
        "percentage_change": percentage_change
    }

    return jsonify(stock_info)


# Function to predict future stock prices
def predict_future(model, recent_data, scaler, days_to_predict=2, time_steps=60):
    predicted_future = []
    input_seq = recent_data[-time_steps:].reshape(-1, 1)  # Last 60 days

    for _ in range(days_to_predict):
        input_reshaped = input_seq.reshape(1, time_steps, 1)
        predicted_price = model.predict(input_reshaped)

        # Ensure correct shape
        predicted_future.append(predicted_price[0][0])

        # Update input sequence
        input_seq = np.append(input_seq[1:], [[predicted_price[0][0]]], axis=0)

    # Convert back to original scale
    predicted_future = scaler.inverse_transform(np.array(predicted_future).reshape(-1, 1))
    return predicted_future.flatten().tolist()

# API Endpoint: Predict next 10 days of stock prices
@app.route("/api/predict/<symbol>", methods=["GET"])
def predict_next_days(symbol):
    try:
        stock = yf.Ticker(symbol)
        df = stock.history(period="3mo")

        if df.empty:
            return jsonify({"error": "No data available for the given stock symbol"}), 404

        if 'Close' not in df or df['Close'].isnull().any():
            return jsonify({"error": "Stock data contains missing or invalid values"}), 400

        if len(df) < 60:
            return jsonify({"error": "Not enough data to make predictions"}), 400

        # Scale the data
        scaler = MinMaxScaler(feature_range=(0, 1))
        df['Close_Scaled'] = scaler.fit_transform(df[['Close']])

        # Get the last 60 days of scaled data
        recent_data = df['Close_Scaled'].values

        # Predict future prices
        future_prices = predict_future(model, recent_data, scaler, days_to_predict=10)

        return jsonify({"symbol": symbol, "predictions": future_prices})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)


if __name__ == "__main__":
    app.run(debug=True)
