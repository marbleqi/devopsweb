FROM centos:7 AS build

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && yum install -y epel-release && yum -y update

WORKDIR /data

RUN curl --silent --location https://rpm.nodesource.com/setup_16.x | bash - \
  && yum install -y nodejs python3 make gcc gcc-c++ \
  && npm i -g npm \
  && npm i -g yarn

COPY . .
RUN yarn && yarn run color-less && yarn run build

FROM nginx
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && mkdir -p /data/html
COPY nginx.conf /etc/nginx/
COPY --from=build /data/dist/html /data/html
