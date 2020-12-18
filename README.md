# Synapse-AI-Cough-Analytics
Synapse’s fifth feature is a cough analytics analyzer that aims to collect audio of coughs and apply AI algorithms to analyze the composition of the coughs and the potential underlying health effects that could cause them. This is especially important because the analyzer can evaluate the severity of a particular cough (and thus a health condition) and can also help doctors better understand what type of ailment a user has, whether it be Bronchitis, COVID-19, or some other form of respiratory disease. As such, this feature is crucial during the current pandemic. For this feature, we developed a cough-audio monitor application system that can collect audio data streams in a continuous manner via Smartphone embedded microphone sensor and apply a set of AI algorithms to analyze them. These AI algorithms have been trained from a compilation of Institutional &amp; Open-source datasets we generated.  This Cough Analyzer assesses forced cough recordings from a user using internal audio microphone sensors to evaluate an illness on the basis of cough identification and classification following a mathematical model eliminating the additional sound layers (by Feature Extraction method), allowing cough sounds to be reconstructed from the feature set while degerating other sounds like background speech automatically. This application reliably collects sound data and uploads them securely to a remote server for subsequent analysis, increasing the accuracy of our model.