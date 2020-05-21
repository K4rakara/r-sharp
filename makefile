.PHONY: all-dev dirs-dev ts-dev sass-dev

all-dev:
	@echo "Compiling r# for development..."; \
	make dirs-dev; \
	make ts-dev; \
	make sass-dev; \
	make cp-dev; \

dirs-dev:
	@echo "Creating directories..."; \
	mkdir -p ./bin/; \

ts-dev:
	@echo "Compiling TypeScript..."; \
	yarn tsc -p ./tsconfig.dev.json; \

sass-dev:
	@echo "Compiling Sass..."; \
	yarn sass ./src:./bin; \

cp-dev:
	@echo "Copying remaining files..."; \
	cp ./src/index.html ./bin/; \
	cp ./src/app-token.key ./bin; \
	cp ./src/oauth-helper/index.html ./bin/oauth-helper; \
	cp ./src/error.html ./bin/; \